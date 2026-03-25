import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { 
  Download, Upload, ChevronRight, Image as ImageIcon, 
  RotateCcw, ZoomIn, ZoomOut, CheckCircle, RefreshCw, Loader2,
  AlignCenter, AlignLeft, AlignRight, Type, Share2, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";
import { uploadToCloudinary } from "@/lib/cloudinary";

const Participate = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
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
        const res = await fetch(`/api/campaigns?id=${id}`);
        const data = await res.json();
        
        if (!data || data.error) throw new Error("Campaign not found");
        setCampaign(data);
        document.title = `${data.title} | Participate — Focal Knot`;
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Campaign not found.");
        document.title = "Campaign Not Found | Focal Knot";
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (campaign?.placeholders) {
      campaign.placeholders.forEach((p: any) => {
        if (p.fontUrl && p.type === 'text') {
          if (!document.querySelector(`link[href="${p.fontUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = p.fontUrl;
            document.head.appendChild(link);
          }
        }
      });
    }
  }, [campaign]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setIsCropping(true);
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
          toast.success(`Font "${file.name}" loaded successfully!`);
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
    const savingId = toast.loading("Saving your poster to our active gallery...");
    
    try {
      const blob = dataURLtoBlob(dataUrl);
      const publicUrl = await uploadToCloudinary(blob, (percent) => {
          toast.loading(`Saving to gallery... ${percent}%`, { id: savingId });
      });

      if (!publicUrl) throw new Error("Failed to upload to Cloudinary.");

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: id,
          image_url: publicUrl,
          user_data: userData,
          frame_title: campaign.title,
        })
      });

      const subData = await res.json();
      if (subData.error) throw new Error(subData.error);

      setSubmissionId(subData._id);
      toast.dismiss(savingId);
      toast.success("Saved to gallery!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save to gallery.");
    } finally {
      setIsSaving(false);
      toast.dismiss(savingId);
    }
  };

  const generatePoster = async () => {
    if (!image || !croppedAreaPixels || !campaign) {
      toast.error("Please ensure your photo is ready.");
      return;
    }

    const loadingId = toast.loading("Generating your high-quality poster...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = campaign.frame_url;
    await new Promise(resolve => frameImg.onload = resolve);
    
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    const userImg = new Image();
    userImg.src = image;
    await new Promise(resolve => userImg.onload = resolve);

    const placeholders = Array.isArray(campaign.placeholders) ? campaign.placeholders : [];
    placeholders.forEach((p: any) => {
      if (p.type === 'rectangle' || p.type === 'circle') {
        ctx.save();
        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
          ctx.clip();
        }
        ctx.drawImage(userImg, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, p.x, p.y, p.width, p.height);
        ctx.restore();
      }
    });

    ctx.drawImage(frameImg, 0, 0);

    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, lineHeight: number, textAlign: CanvasTextAlign) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      ctx.textAlign = textAlign;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
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
        const customFontNames = Object.values(customFonts);
        const fFamily = customFontNames.length > 0 ? customFontNames[customFontNames.length - 1] : (p.fontFamily || 'sans-serif');
        
        ctx.font = `bold ${fSize}px "${fFamily}"`;
        ctx.fillStyle = p.color || "white";
        
        let textX = p.x + p.width/2;
        if (tAlign === 'left') textX = p.x;
        if (tAlign === 'right') textX = p.x + p.width;

        drawWrappedText(value, textX, p.y + fSize, p.width, fSize, lHeight, tAlign as CanvasTextAlign);
      }
    });

    const result = canvas.toDataURL("image/png", 1.0);
    setFinalPreview(result);
    setIsCropping(false);
    toast.dismiss(loadingId);
    toast.success("Poster Generated!");
    uploadAndSave(result);
  };

  const downloadPoster = () => {
    if (!finalPreview) return;
    const link = document.createElement('a');
    link.download = `FK_Campaign_Result.png`;
    link.href = finalPreview;
    link.click();
    toast.success("Downloaded!");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-16">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-gray-500 font-bold">Loading campaign details...</p>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-16 px-4 text-center">
      <h2 className="text-4xl font-black text-gray-900 mb-4">Campaign Not Found</h2>
      <Link to="/campaigns"><Button className="bg-indigo-600 rounded-2xl px-8 h-14 font-bold shadow-xl">Back to Campaigns</Button></Link>
    </div>
  );

  const placeholders = Array.isArray(campaign.placeholders) ? campaign.placeholders : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{campaign.title}</h2>
            <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest rounded-full uppercase">LIVE</div>
          </div>

          <div className="p-8 md:p-12">
            {!image && !finalPreview && (
              <div className="text-center py-20 border-4 border-dashed border-gray-100 rounded-[2.5rem] group hover:border-indigo-400 transition-all cursor-pointer relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Upload Your Photo</h3>
                <p className="text-gray-500 font-medium">Capture or pick a photo to add to this frame.</p>
              </div>
            )}

            {image && isCropping && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="relative w-full aspect-square md:h-[600px] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
                  <Cropper image={image} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} classes={{ containerClassName: "cursor-move" }} />
                </div>
                <div className="flex items-center gap-6 px-4">
                  <ZoomOut className="w-5 h-5 text-gray-400" />
                  <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <ZoomIn className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-6 pt-4">
                  {placeholders.map((p: any) => p.type === 'text' && (
                    <div key={p.id} className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{p.label || "Display Name"}</label>
                        <input type="text" placeholder="Type here..." onChange={(e) => setUserData({...userData, [p.id]: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[1.25rem] px-6 py-5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-lg font-bold shadow-sm" />
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button key={align} onClick={() => setTextSettings(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || { lineHeight: 1.2, textAlign: 'center' }), textAlign: align }}))} className={`p-3 rounded-xl transition-all ${(textSettings[p.id]?.textAlign || p.textAlign || 'center') === align ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                              {align === 'left' && <AlignLeft className="w-5 h-5" />}
                              {align === 'center' && <AlignCenter className="w-5 h-5" />}
                              {align === 'right' && <AlignRight className="w-5 h-5" />}
                            </button>
                          ))}
                        </div>
                        <div className="flex-1">
                          <input type="file" accept=".ttf,.woff,.woff2" className="hidden" ref={fontInputRef} onChange={handleFontUpload} />
                          <Button variant="outline" type="button" onClick={() => fontInputRef.current?.click()} className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-400 gap-2 font-bold"><Type className="w-5 h-5" /> Load Font</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-20 text-xl font-black bg-indigo-600 hover:bg-indigo-700 rounded-[1.5rem] shadow-2xl shadow-indigo-100 gap-3 transition-all active:scale-[0.98]" onClick={generatePoster}>Next: Mix into Frame <ChevronRight className="w-6 h-6" /></Button>
              </div>
            )}

            {finalPreview && (
              <div className="text-center space-y-10 animate-in zoom-in-95 duration-500">
                <div className="relative inline-block group rounded-[2.5rem] p-4 bg-black border border-gray-100 shadow-inner">
                  <img src={finalPreview} alt="Result" className="max-w-full rounded-[2rem] shadow-2xl border-8 border-white" />
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                      <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">Publishing Poster...</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-5 max-w-md mx-auto">
                  <Button size="lg" className="h-20 text-xl font-black bg-green-600 hover:bg-green-700 rounded-[1.5rem] shadow-2xl shadow-green-100 gap-3 transition-all active:scale-[0.98]" onClick={downloadPoster}><Download className="w-6 h-6" /> Download Poster</Button>
                  {submissionId && (
                    <Button size="lg" onClick={() => {
                        const shareUrl = `${window.location.origin}/share/${submissionId}`;
                        if (navigator.share) navigator.share({ title: campaign.title, text: `My Focal Knot poster!`, url: shareUrl });
                        else { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }
                      }}
                      className="h-20 text-xl font-black bg-indigo-600 hover:bg-indigo-700 rounded-[1.5rem] shadow-2xl shadow-indigo-100 gap-3 transition-all active:scale-[0.98]"
                    >
                      <Share2 className="w-6 h-6" /> Share to Gallery
                    </Button>
                  )}
                  <Button variant="outline" size="lg" className="h-16 rounded-[1.25rem] gap-2 font-bold text-gray-500 border-2 border-gray-100" onClick={() => { setFinalPreview(null); setImage(null); setIsCropping(false); setSubmissionId(null); }}><RefreshCw className="w-5 h-5" /> Try Another</Button>
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
