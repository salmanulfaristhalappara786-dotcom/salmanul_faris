import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { 
  Plus, Image as ImageIcon, X, Save, Square, Circle as CircleIcon, Trash2,
  AlignLeft, AlignCenter, AlignRight, Type as TypeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/context/AuthContext";

export interface Placeholder {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  previewText?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  lineHeight?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const initialFonts = [
  { name: "Arial", value: "Arial" },
  { name: "Manjari (മലയാളം)", value: "'Manjari', sans-serif" },
  { name: "Noto Sans (മലയാളം)", value: "'Noto Sans Malayalam', sans-serif" },
];

interface FrameEditorProps {
    editId?: string | null;
    initialData?: {
        title: string;
        frame_url: string;
        placeholders: Placeholder[];
    } | null;
    onSaveSuccess: () => void;
    onCancel: () => void;
}

export const FrameEditor = ({ editId, initialData, onSaveSuccess, onCancel }: FrameEditorProps) => {
  const { user } = useAuth();
  const [frameImage, setFrameImage] = useState<string | null>(initialData?.frame_url || null);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>(initialData?.placeholders || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [campaignTitle, setCampaignTitle] = useState(initialData?.title || "New Campaign");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ title: initialData?.title || "", description: "Share your voice.", slug: initialData?.title?.toLowerCase().replace(/ /g, "-") || "" });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFrameImage(initialData.frame_url);
      setPlaceholders(initialData.placeholders || []);
      setCampaignTitle(initialData.title);
      setNewCampaignData({ title: initialData.title, description: "Share your voice.", slug: initialData.title.toLowerCase().replace(/ /g, "-") });
    }
  }, [initialData]);

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFrameImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addPlaceholder = (type: 'rectangle' | 'circle' | 'text') => {
    const newPlaceholder: Placeholder = {
      id: Math.random().toString(36).slice(2, 11),
      type, x: 100, y: 100,
      width: type === 'text' ? 180 : 150,
      height: type === 'text' ? 50 : 150,
      label: type === 'text' ? "നിങ്ങളുടെ പേര് ഇവിടെ ടൈപ്പ് ചെയ്യുക" : undefined,
      previewText: type === 'text' ? "Sample Text" : undefined,
      fontSize: type === 'text' ? 22 : undefined,
      fontFamily: type === 'text' ? "'Manjari', sans-serif" : 'Arial',
      color: '#000000',
      lineHeight: 1.4,
      textAlign: 'center',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none'
    };
    setPlaceholders([...placeholders, newPlaceholder]);
    setSelectedId(newPlaceholder.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      const dx = e.clientX - dragOffset.x;
      const dy = e.clientY - dragOffset.y;
      setPlaceholders(placeholders.map(p => p.id === selectedId ? { ...p, x: p.x + dx, y: p.y + dy } : p));
      setDragOffset({ x: e.clientX, y: e.clientY });
    } else if (isResizing && selectedId) {
      const dx = e.clientX - dragOffset.x;
      const dy = e.clientY - dragOffset.y;
      setPlaceholders(placeholders.map(p => p.id === selectedId ? { ...p, width: Math.max(20, p.width + dx), height: Math.max(20, p.height + dy) } : p));
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const finalizeSave = async () => {
    const loadingToastId = toast.loading("Saving campaign...");
    try {
      if (!frameImage) throw new Error("No frame image found.");
      
      let publicUrl = frameImage;
      if (frameImage.startsWith('data:')) {
          const blob = await (await fetch(frameImage)).blob();
          publicUrl = await uploadToCloudinary(blob, (p) => toast.loading(`Uploading... ${p}%`, { id: loadingToastId }));
      }
      
      if (!publicUrl) throw new Error("Upload failed.");

      const saveRes = await fetch(editId ? `/api/campaigns?id=${editId}` : '/api/campaigns', {
        method: editId ? 'PUT' : 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-requester-id': user!.id,
            'x-requester-role': user!.role || 'user'
        },
        body: JSON.stringify({
            title: newCampaignData.title,
            description: newCampaignData.description,
            slug: newCampaignData.slug,
            frame_url: publicUrl,
            placeholders,
            status: 'active',
            owner_id: user?.id
        })
      });
      
      if (!saveRes.ok) throw new Error("Server failed to save");
      
      toast.dismiss(loadingToastId);
      toast.success(editId ? "Updated Successfully!" : "Published Successfully!");
      onSaveSuccess();
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message);
    }
  };

  const selectedPlaceholder = placeholders.find(p => p.id === selectedId);

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <header className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4">
          <Button onClick={onCancel} variant="outline" className="rounded-xl border-gray-200"><X size={18} /> Exit Studio</Button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Frame Studio</h2>
        </div>
        <Button onClick={() => {
            setNewCampaignData({ title: campaignTitle, description: "Share your voice.", slug: campaignTitle.toLowerCase().replace(/ /g, "-") });
            setIsModalOpen(true);
        }} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 font-black flex items-center gap-2"><Save size={18} /> {editId ? 'Update' : 'Publish'}</Button>
      </header>

      <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Canvas Area */}
        <div className="xl:col-span-8 bg-gray-50 rounded-[2.5rem] flex items-center justify-center p-8 min-h-[500px] relative border-2 border-dashed border-gray-100">
             <div ref={containerRef} className="relative bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-[500px] aspect-square" onMouseMove={handleMouseMove} onMouseUp={() => {setIsDragging(false); setIsResizing(false);}}>
                {frameImage ? <img src={frameImage} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" /> : <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"><ImageIcon size={40} className="text-gray-200 group-hover:text-indigo-600 transition-colors" /><span className="mt-4 text-[10px] font-black text-gray-300">UPLOAD FRAME PNG</span><input type="file" className="hidden" onChange={handleFrameUpload} accept="image/*" /></label>}
                {placeholders.map(p => (
                    <div key={p.id} className="absolute group z-20" style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
                        <div onMouseDown={(e) => { setSelectedId(p.id); setIsDragging(true); setDragOffset({ x: e.clientX, y: e.clientY }); }} className={`w-full h-full flex items-center justify-center transition-all ${selectedId === p.id ? 'ring-4 ring-indigo-500/30 border-2 border-indigo-600 shadow-xl' : 'border border-dashed border-gray-300'}`} style={{ borderRadius: p.type === 'circle' ? '50%' : '12px', backgroundColor: p.type === 'text' ? 'transparent' : 'rgba(99, 102, 241, 0.15)' }}>
                            {p.type === 'text' ? (
                                <span style={{ fontSize: p.fontSize, fontFamily: p.fontFamily, color: p.color, textAlign: p.textAlign, fontWeight: p.fontWeight, fontStyle: p.fontStyle, textDecoration: p.textDecoration, lineHeight: p.lineHeight }}>{p.previewText || p.label}</span>
                            ) : (
                                <ImageIcon size={p.width/5} className="text-indigo-400 opacity-40" />
                            )}
                        </div>
                        {selectedId === p.id && <button onClick={() => { setPlaceholders(placeholders.filter(ph => ph.id !== p.id)); setSelectedId(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-30"><X size={12} /></button>}
                        {selectedId === p.id && <div onMouseDown={(e) => { e.stopPropagation(); setSelectedId(p.id); setIsResizing(true); setDragOffset({ x: e.clientX, y: e.clientY }); }} className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-sm cursor-nwse-resize shadow-md z-30" />}
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar Settings Area */}
        <div className="xl:col-span-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Frame Name</label>
                <input type="text" value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold" placeholder="Give your frame a name..." />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Add Placeholders</p>
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => addPlaceholder('rectangle')} className="bg-green-500 hover:bg-green-600 text-xs font-black rounded-xl h-12"><Square size={16} /> Rect</Button>
                    <Button onClick={() => addPlaceholder('circle')} className="bg-emerald-500 hover:bg-emerald-600 text-xs font-black rounded-xl h-12"><CircleIcon size={16} /> Circle</Button>
                    <Button onClick={() => addPlaceholder('text')} className="col-span-2 bg-blue-500 hover:bg-blue-600 text-xs font-black rounded-xl h-12"><TypeIcon size={16} /> Add Name/Text Field</Button>
                </div>
            </div>

            {selectedPlaceholder && (
                <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                    {selectedPlaceholder.type === 'text' ? (
                        <div className="space-y-4">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Label (for users)</label><input type="text" value={selectedPlaceholder.label} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, label: e.target.value} : ph))} className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Size</label><input type="number" value={selectedPlaceholder.fontSize} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, fontSize: parseInt(e.target.value)} : ph))} className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Color</label><input type="color" value={selectedPlaceholder.color} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, color: e.target.value} : ph))} className="w-full h-9 border border-gray-100 rounded-xl mt-1" /></div>
                            </div>
                            <select value={selectedPlaceholder.fontFamily} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, fontFamily: e.target.value} : ph))} className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm">{initialFonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}</select>
                            <div className="flex gap-1 justify-between">
                                <Button size="sm" variant={selectedPlaceholder.textAlign === 'left' ? 'default' : 'outline'} onClick={() => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, textAlign: 'left'} : ph))} className="flex-1"><AlignLeft size={14} /></Button>
                                <Button size="sm" variant={selectedPlaceholder.textAlign === 'center' ? 'default' : 'outline'} onClick={() => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, textAlign: 'center'} : ph))} className="flex-1"><AlignCenter size={14} /></Button>
                                <Button size="sm" variant={selectedPlaceholder.textAlign === 'right' ? 'default' : 'outline'} onClick={() => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, textAlign: 'right'} : ph))} className="flex-1"><AlignRight size={14} /></Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1"><label>Width</label><input type="number" value={Math.round(selectedPlaceholder.width)} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, width: parseInt(e.target.value)} : ph))} className="w-full border border-gray-100 rounded-xl px-3 py-2" /></div>
                            <div className="space-y-1"><label>Height</label><input type="number" value={Math.round(selectedPlaceholder.height)} onChange={e => setPlaceholders(placeholders.map(ph => ph.id === selectedId ? {...ph, height: parseInt(e.target.value)} : ph))} className="w-full border border-gray-100 rounded-xl px-3 py-2" /></div>
                        </div>
                    )}
                    <Button onClick={() => { setPlaceholders(placeholders.filter(ph => ph.id !== selectedId)); setSelectedId(null); }} className="w-full bg-red-50 text-red-500 hover:bg-red-100 border-none font-black text-[10px] rounded-xl"><Trash2 size={14} /> Remove Element</Button>
                </div>
            )}
        </div>
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400"><X size={20} /></button>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Finalize & Publish</h3>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Campaign Title</label><input type="text" value={newCampaignData.title} onChange={e => setNewCampaignData({...newCampaignData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">URL Slug</label><input type="text" value={newCampaignData.slug} onChange={e => setNewCampaignData({...newCampaignData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold" /></div>
                    <Button onClick={finalizeSave} className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl mt-6 shadow-xl">START CAMPAIGN NOW</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
