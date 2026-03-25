import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { 
  Download, Upload, ImageIcon, 
  ZoomIn, ZoomOut, CheckCircle, RefreshCw, Loader2,
  AlignCenter, AlignLeft, AlignRight, Type, X, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, Link, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "@/lib/cloudinary";

const Participate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placeholderData, setPlaceholderData] = useState<Record<string, { image: string | null; crop: { x: number; y: number }; zoom: number; pixels: any; isCropping: boolean }>>({});
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns?slug=${id}`);
        const data = await res.json();
        if (!data || data.error) {
            const resId = await fetch(`/api/campaigns?id=${id}`);
            const dataId = await resId.json();
            if (!dataId || dataId.error) throw new Error("Campaign not found");
            setCampaign(dataId);
        } else setCampaign(data);
      } catch (error) {
        toast.error("Campaign not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, pId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPlaceholderData(prev => ({
          ...prev,
          [pId]: { image: reader.result as string, crop: { x: 0, y: 0 }, zoom: 1, pixels: null, isCropping: true }
        }));
        setFinalPreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePoster = async () => {
    const placeholders = Array.isArray(campaign.placeholders) ? campaign.placeholders : [];
    const imagePlaceholders = placeholders.filter(p => p.type === 'rectangle' || p.type === 'circle');
    
    for (const p of imagePlaceholders) {
        if (!placeholderData[p.id]?.pixels) {
            toast.error(`Please adjust Photo for ${p.label || 'placeholder'}`);
            return;
        }
    }

    setIsGenerating(true);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.src = campaign.frame_url;
        await new Promise(resolve => frameImg.onload = resolve);
        
        canvas.width = frameImg.width;
        canvas.height = frameImg.height;
        const sx = frameImg.width / 500;
        const sy = frameImg.height / 500;

        // Draw images first
        for (const p of imagePlaceholders) {
          if (placeholderData[p.id]?.image && placeholderData[p.id]?.pixels) {
            ctx.save();
            const scaledX = p.x * sx;
            const scaledY = p.y * sy;
            const scaledWidth = p.width * sx;
            const scaledHeight = p.height * sy;
            const scaledRadius = (p.borderRadius || 0) * sx;

            if (p.type === 'circle') {
              ctx.beginPath();
              ctx.arc(scaledX + scaledWidth/2, scaledY + scaledHeight/2, scaledWidth/2, 0, Math.PI * 2);
              ctx.clip();
            } else if (p.type === 'rectangle' && scaledRadius > 1) {
              ctx.beginPath();
              ctx.moveTo(scaledX + scaledRadius, scaledY);
              ctx.lineTo(scaledX + scaledWidth - scaledRadius, scaledY);
              ctx.quadraticCurveTo(scaledX + scaledWidth, scaledY, scaledX + scaledWidth, scaledY + scaledRadius);
              ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - scaledRadius);
              ctx.quadraticCurveTo(scaledX + scaledWidth, scaledY + scaledHeight, scaledX + scaledWidth - scaledRadius, scaledY + scaledHeight);
              ctx.lineTo(scaledX + scaledRadius, scaledY + scaledHeight);
              ctx.quadraticCurveTo(scaledX, scaledY + scaledHeight, scaledX, scaledY + scaledHeight - scaledRadius);
              ctx.lineTo(scaledX, scaledY + scaledRadius);
              ctx.quadraticCurveTo(scaledX, scaledY, scaledX + scaledRadius, scaledY);
              ctx.closePath();
              ctx.clip();
            }

            const data = placeholderData[p.id];
            const userImg = new Image();
            userImg.src = data.image as string;
            await new Promise(resolve => userImg.onload = resolve);
            ctx.drawImage(userImg, data.pixels.x, data.pixels.y, data.pixels.width, data.pixels.height, scaledX, scaledY, scaledWidth, scaledHeight);
            ctx.restore();
          }
        }

        ctx.drawImage(frameImg, 0, 0);

        // Text
        placeholders.forEach((p: any) => {
          if (p.type === 'text') {
            const value = userData[p.id] || "";
            const fSize = p.fontSize || 30;
            const tAlign = p.textAlign || "center";
            const fFamily = p.fontFamily || 'sans-serif';
            const fWeight = p.fontWeight || 'bold';
            
            ctx.font = `${fWeight} ${fSize * sx}px "${fFamily}"`;
            ctx.fillStyle = p.color || "white";
            ctx.textAlign = tAlign as CanvasTextAlign;
            ctx.textBaseline = 'top';
            
            let textX = (p.x + p.width/2) * sx;
            if (tAlign === 'left') textX = p.x * sx;
            if (tAlign === 'right') textX = (p.x + p.width) * sx;

            ctx.fillText(value, textX, p.y * sy);
          }
        });

        const result = canvas.toDataURL("image/png", 1.0);
        setFinalPreview(result);
        
        // Auto-save submission
        const blob = await (await fetch(result)).blob();
        const publicUrl = await uploadToCloudinary(blob);
        if (publicUrl) {
            await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: campaign._id,
                    image_url: publicUrl,
                    user_data: userData,
                })
            });
        }
    } catch (err) {
        toast.error("Generation failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const downloadPoster = () => {
    if (!finalPreview) return;
    const link = document.createElement('a');
    link.download = `${campaign.title}_Poster.png`;
    link.href = finalPreview;
    link.click();
    toast.success("Downloaded!");
  };

  if (loading) return <div className="min-h-screen bg-[#60A5FA] flex items-center justify-center"><Loader2 className="w-12 h-12 text-white animate-spin" /></div>;
  if (!campaign) return <div className="min-h-screen bg-[#60A5FA] flex items-center justify-center text-white font-bold text-2xl">Campaign Not Found</div>;

  const placeholders = Array.isArray(campaign.placeholders) ? campaign.placeholders : [];

  return (
    <div className="min-h-screen bg-[#60A5FA] pb-12 pt-16">
      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={28} /></button>
            <h1 className="text-xl font-black uppercase tracking-tight">{campaign.title}</h1>
            <div className="w-10"></div>
        </div>

        {/* User Experience Container */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 p-6 shadow-2xl space-y-8">
            
            {/* 1. PREVIEW PANEL */}
            <div className="relative aspect-square bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/30 shadow-inner group">
                {finalPreview ? (
                    <img src={finalPreview} alt="Result" className="w-full h-full object-contain animate-in zoom-in-95 duration-500" />
                ) : (
                    <div className="w-full h-full relative">
                        <img src={campaign.frame_url} className="w-full h-full object-contain pointer-events-none z-10 relative" alt="Frame" />
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-white/40 gap-3">
                            <ImageIcon size={48} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Live Preview</p>
                        </div>
                    </div>
                )}
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[2.5rem]">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                        <span className="text-white font-bold text-xs uppercase tracking-widest">Generating Your Art...</span>
                    </div>
                )}
            </div>

            {/* 2. ACTIONS PANEL */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl space-y-6">
                {!finalPreview ? (
                    <>
                        {placeholders.map((p: any) => (p.type === 'rectangle' || p.type === 'circle') && (
                            <div key={p.id} className="space-y-4">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">{p.label || "Step 1: Upload Your Photo"}</p>
                                {!placeholderData[p.id]?.image ? (
                                    <div className="relative h-64 bg-blue-50 border-4 border-dashed border-blue-200 rounded-[2rem] flex flex-col items-center justify-center group hover:border-blue-500 transition-all cursor-pointer overflow-hidden">
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, p.id)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform"><Upload size={24} /></div>
                                        <span className="mt-4 font-black text-blue-900 text-sm">CHOOSE PHOTO</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                        <div className="relative aspect-square bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                            <Cropper 
                                                image={placeholderData[p.id].image as string} 
                                                crop={placeholderData[p.id].crop} 
                                                zoom={placeholderData[p.id].zoom} 
                                                aspect={p.width / p.height} 
                                                onCropChange={(c) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], crop: c }}))} 
                                                onCropComplete={(a, px) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], pixels: px }}))} 
                                                onZoomChange={(z) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], zoom: z }}))} 
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <ZoomOut size={16} className="text-gray-400" />
                                            <input type="range" value={placeholderData[p.id].zoom} min={1} max={3} step={0.1} onChange={(e) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], zoom: Number(e.target.value) }}))} className="flex-1 accent-blue-600" />
                                            <ZoomIn size={16} className="text-gray-400" />
                                        </div>
                                        <Button variant="outline" onClick={() => setPlaceholderData(prev => { const upd = { ...prev }; delete upd[p.id]; return upd; })} className="w-full h-12 rounded-xl text-red-500 border-red-100 hover:bg-red-50 font-bold"><RefreshCw size={16} className="mr-2" /> Change Photo</Button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {placeholders.map((p: any) => p.type === 'text' && (
                            <div key={p.id} className="space-y-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">{p.label || "Enter Your Name"}</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Type here..."
                                        onChange={(e) => setUserData({...userData, [p.id]: e.target.value})} 
                                        className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] px-6 py-5 font-black text-blue-900 outline-none transition-all placeholder:text-blue-300 shadow-sm"
                                    />
                                    <Type className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200" size={20} />
                                </div>
                            </div>
                        ))}

                        <Button 
                            className="w-full h-20 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            onClick={generatePoster}
                            disabled={isGenerating}
                        >
                            CREATE POSTER
                        </Button>
                    </>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 bg-green-50 p-6 rounded-[2rem] border border-green-100">
                            <div className="bg-green-500 p-3 rounded-full text-white shadow-lg"><CheckCircle size={24} /></div>
                            <div>
                                <h4 className="font-black text-green-900 text-lg">Hooray! Ready.</h4>
                                <p className="text-green-600 text-xs font-bold">Your frame is perfectly processed.</p>
                            </div>
                        </div>
                        <Button 
                            className="w-full h-24 bg-[#22C55E] hover:bg-[#16A34A] text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-green-200 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                            onClick={downloadPoster}
                        >
                            <Download size={32} /> DOWNLOAD NOW
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => { setFinalPreview(null); setPlaceholderData({}); }} 
                            className="w-full h-16 rounded-[1.5rem] font-bold border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} /> Create Another
                        </Button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Powered by Focal Knot Creative Studio</p>
      </div>
    </div>
  );
};

export default Participate;
