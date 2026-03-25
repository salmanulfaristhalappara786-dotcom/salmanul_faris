import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { 
  Download, Upload, ChevronRight, Image as ImageIcon, 
  RotateCcw, ZoomIn, ZoomOut, CheckCircle, RefreshCw, Loader2,
  AlignCenter, AlignLeft, AlignRight, Type, Share2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";
import { uploadToCloudinary } from "@/lib/cloudinary";

const Participate = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placeholderData, setPlaceholderData] = useState<Record<string, { image: string | null; crop: { x: number; y: number }; zoom: number; pixels: any; isCropping: boolean }>>({});
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [textSettings, setTextSettings] = useState<Record<string, {lineHeight: number, textAlign: 'left' | 'center' | 'right'}>>({});
  const [customFonts, setCustomFonts] = useState<Record<string, string>>({});
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

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
        } else {
            setCampaign(data);
        }
        document.title = `${data.title} | Participate — Focal Knot`;
      } catch (error) {
        console.error("Error fetching campaign:", error);
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
          [pId]: {
            image: reader.result as string,
            crop: { x: 0, y: 0 },
            zoom: 1,
            pixels: null,
            isCropping: true
          }
        }));
        setFinalPreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = `CustomFont_${Date.now()}`;
      const reader = new FileReader();
      reader.onload = async () => {
        const fontFace = new FontFace(fontName, `url(${reader.result})`);
        try {
          const loadedFace = await fontFace.load();
          document.fonts.add(loadedFace);
          setCustomFonts(prev => ({ ...prev, [file.name]: fontName }));
          toast.success(`Font "${file.name}" loaded!`);
        } catch (err) {
          toast.error("Failed to load font.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const uploadAndSave = async (dataUrl: string) => {
    setIsSaving(true);
    const savingId = toast.loading("Publishing to gallery...");
    try {
      const blob = dataURLtoBlob(dataUrl);
      const publicUrl = await uploadToCloudinary(blob, (percent) => {
          toast.loading(`Uploading... ${percent}%`, { id: savingId });
      });
      if (!publicUrl) throw new Error("Upload failed.");

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign._id,
          image_url: publicUrl,
          user_data: userData,
          frame_title: campaign.title,
        })
      });
      const subData = await res.json();
      setSubmissionId(subData._id);
      toast.dismiss(savingId);
      toast.success("Saved!");
    } catch (err) {
      toast.error("Failed to save.");
    } finally {
      setIsSaving(false);
      toast.dismiss(savingId);
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

    const loadingId = toast.loading("Mixing into Frame...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = campaign.frame_url;
    await new Promise(resolve => frameImg.onload = resolve);
    
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    // Draw images
    for (const p of imagePlaceholders) {
      if (placeholderData[p.id]?.image && placeholderData[p.id]?.pixels) {
        ctx.save();
        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
          ctx.clip();
        }
        const data = placeholderData[p.id];
        const userImg = new Image();
        userImg.src = data.image as string;
        await new Promise(resolve => userImg.onload = resolve);
        ctx.drawImage(userImg, data.pixels.x, data.pixels.y, data.pixels.width, data.pixels.height, p.x, p.y, p.width, p.height);
        ctx.restore();
      }
    }

    ctx.drawImage(frameImg, 0, 0);

    // Text Wrap logic
    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, lineHeight: number, textAlign: CanvasTextAlign) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      ctx.textAlign = textAlign;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += fontSize * lineHeight;
        } else line = testLine;
      }
      ctx.fillText(line.trim(), x, currentY);
    };

    placeholders.forEach((p: any) => {
      if (p.type === 'text') {
        const value = userData[p.id] || "";
        const fSize = p.fontSize || 30;
        const lHeight = (textSettings[p.id]?.lineHeight) || p.lineHeight || 1.2;
        const tAlign = (textSettings[p.id]?.textAlign) || p.textAlign || "center";
        const fFamily = p.fontFamily || 'sans-serif';
        const fWeight = p.fontWeight || 'bold';
        const fStyle = p.fontStyle || 'normal';
        const tDeco = p.textDecoration || 'none';
        
        ctx.font = `${fStyle} ${fWeight} ${fSize}px "${fFamily}"`;
        ctx.fillStyle = p.color || "white";
        ctx.textBaseline = 'top';
        
        let textX = p.x + p.width/2;
        if (tAlign === 'left') textX = p.x;
        if (tAlign === 'right') textX = p.x + p.width;

        drawWrappedText(value, textX, p.y + fSize, p.width, fSize, lHeight, tAlign as CanvasTextAlign);

        if (tDeco === 'underline') {
          const metrics = ctx.measureText(value);
          const textWidth = metrics.width;
          let lineX = textX;
          if (tAlign === 'center') lineX = textX - textWidth / 2;
          if (tAlign === 'right') lineX = textX - textWidth;

          ctx.beginPath();
          ctx.strokeStyle = p.color || "white";
          ctx.lineWidth = Math.max(1, fSize / 15);
          ctx.moveTo(lineX, p.y + fSize + fSize * 1.1);
          ctx.lineTo(lineX + textWidth, p.y + fSize + fSize * 1.1);
          ctx.stroke();
        }
      }
    });

    const result = canvas.toDataURL("image/png", 1.0);
    setFinalPreview(result);
    setPlaceholderData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => updated[k].isCropping = false);
        return updated;
    });
    toast.dismiss(loadingId);
    toast.success("Ready!");
    uploadAndSave(result);
  };

  const downloadPoster = () => {
    if (!finalPreview) return;
    const link = document.createElement('a');
    link.download = `Campaign_Poster.png`;
    link.href = finalPreview;
    link.click();
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (!campaign) return <div className="min-h-screen flex items-center justify-center p-8"><h2>Not Found</h2></div>;

  const placeholders = Array.isArray(campaign.placeholders) ? campaign.placeholders : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">{campaign.title}</h2>
            <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase">LIVE</div>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            {!finalPreview && (
              <>
                {placeholders.map((p: any) => (p.type === 'rectangle' || p.type === 'circle') && (
                  <div key={p.id} className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.label || "Upload Photo"}</p>
                    {!placeholderData[p.id]?.image ? (
                        <div className="text-center py-16 border-4 border-dashed border-gray-100 rounded-[2.5rem] relative hover:border-indigo-400 transition-all cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, p.id)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                            <h3 className="font-black text-gray-900">Upload Photo</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {placeholderData[p.id].isCropping ? (
                                <div className="space-y-4">
                                    <div className="relative aspect-square bg-black rounded-[2rem] overflow-hidden shadow-xl">
                                        <Cropper 
                                            image={placeholderData[p.id].image as string} 
                                            crop={placeholderData[p.id].crop} 
                                            zoom={placeholderData[p.id].zoom} 
                                            aspect={p.width / p.height} 
                                            onCropChange={(c) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], crop: c }}))} 
                                            onCropComplete={(a, px) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], pixels: px }}))} 
                                            onZoomChange={(z) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], zoom: z }}))} 
                                        />
                                        <div className="absolute inset-0 pointer-events-none z-20 opacity-40">
                                            <img src={campaign.frame_url} className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <ZoomOut size={16} />
                                        <input type="range" value={placeholderData[p.id].zoom} min={1} max={3} step={0.1} onChange={(e) => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], zoom: Number(e.target.value) }}))} className="flex-1" />
                                        <ZoomIn size={16} />
                                        <Button size="sm" onClick={() => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], isCropping: false }}))} className="bg-green-600 rounded-xl">Confirm</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group rounded-[2rem] overflow-hidden border-2 border-indigo-50 h-32 flex items-center justify-between px-8 bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm"><CheckCircle /></div>
                                        <span className="font-bold">{p.label || "Photo Ready"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPlaceholderData(prev => ({ ...prev, [p.id]: { ...prev[p.id], isCropping: true }}))} className="rounded-xl">Edit</Button>
                                        <Button variant="outline" size="sm" onClick={() => setPlaceholderData(prev => { const upd = { ...prev }; delete upd[p.id]; return upd; })} className="rounded-xl text-red-500">Remove</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                ))}

                <div className="space-y-6 pt-6 border-t border-gray-50">
                  {placeholders.map((p: any) => p.type === 'text' && (
                    <div key={p.id} className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.label}</label>
                      <input type="text" onChange={(e) => setUserData({...userData, [p.id]: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                      <div className="flex gap-2">
                         {(['left', 'center', 'right'] as const).map(a => (
                             <Button key={a} size="sm" variant={(textSettings[p.id]?.textAlign || p.textAlign || 'center') === a ? "default" : "outline"} onClick={() => setTextSettings(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || { lineHeight: 1.2, textAlign: 'center' }), textAlign: a }}))} className="rounded-xl">
                                {a === 'left' && <AlignLeft size={16} />}
                                {a === 'center' && <AlignCenter size={16} />}
                                {a === 'right' && <AlignRight size={16} />}
                             </Button>
                         ))}
                         <Button size="sm" variant="outline" onClick={() => fontInputRef.current?.click()} className="rounded-xl ml-auto"><Type size={16} className="mr-2" /> Font</Button>
                         <input type="file" ref={fontInputRef} className="hidden" onChange={handleFontUpload} />
                      </div>
                    </div>
                  ))}
                  <Button className="w-full h-16 text-lg font-black bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100" onClick={generatePoster}>Mix into Frame <ChevronRight size={24} /></Button>
                </div>
              </>
            )}

            {finalPreview && (
              <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="relative inline-block rounded-[2.5rem] p-3 bg-black">
                  <img src={finalPreview} alt="Result" className="max-w-full rounded-[2rem] shadow-2xl border-4 border-white" />
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                      <p className="font-black text-sm uppercase">Saving...</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                   <Button size="lg" className="h-16 text-lg font-black bg-green-600 rounded-2xl shadow-xl shadow-green-100" onClick={downloadPoster}><Download size={20} className="mr-2" /> Download Poster</Button>
                   <Button variant="outline" onClick={() => { setFinalPreview(null); setPlaceholderData({}); setSubmissionId(null); }} className="h-14 rounded-2xl"><RefreshCw size={18} className="mr-2" /> Try Another</Button>
                   <Link to="/campaigns" className="text-indigo-600 font-bold hover:underline">Browse More Campaigns</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Participate;
