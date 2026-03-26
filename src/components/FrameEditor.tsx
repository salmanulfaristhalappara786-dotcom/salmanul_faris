import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { 
  Plus, Square, Circle as CircleIcon, Type as TypeIcon, Save, X, 
  Trash2, Image as ImageIcon, AlignCenter, AlignLeft, AlignRight,
  User, CheckCircle, Smartphone, Layout
} from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

export interface Placeholder {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  label?: string;
  fontSize?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontWeight?: string;
  x_pct?: number;
  y_pct?: number;
  w_pct?: number;
  h_pct?: number;
}

interface FrameEditorProps {
  editId?: string;
  initialData?: {
    title: string;
    frame_url: string;
    placeholders: Placeholder[];
  } | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const FrameEditor = ({ editId, initialData, onSaveSuccess, onCancel }: FrameEditorProps) => {
  const [frameUrl, setFrameUrl] = useState<string>(initialData?.frame_url || "");
  const [placeholders, setPlaceholders] = useState<Placeholder[]>(initialData?.placeholders || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorDimensions, setEditorDimensions] = useState({ width: 500, height: 500 });
  const [newCampaignData, setNewCampaignData] = useState({ title: initialData?.title || "", description: "Share your voice.", slug: initialData?.title?.toLowerCase().replace(/ /g, "-") || "" });

  const editorWidth = 500;

  useEffect(() => {
    if (initialData?.frame_url) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.height / img.width;
        setEditorDimensions({ width: 500, height: 500 * ratio });
      };
      img.src = initialData.frame_url;
    }
  }, [initialData]);

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.height / img.width;
          setEditorDimensions({ width: 500, height: 500 * ratio });
          setFrameUrl(reader.result as string);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addPlaceholder = (type: 'rectangle' | 'circle' | 'text') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newP: Placeholder = {
      id, type, x: 50, y: 50, width: type === 'text' ? 200 : 150, height: type === 'text' ? 40 : 150,
      label: type === 'text' ? 'Enter Name' : 'Photo',
      fontSize: 24, color: '#000000', textAlign: 'center', borderRadius: 0
    };
    setPlaceholders([...placeholders, newP]);
    setSelectedId(id);
  };

  const updatePlaceholder = (id: string, updates: Partial<Placeholder>) => {
    setPlaceholders(placeholders.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSave = async () => {
    if (!newCampaignData.title) {
        toast.error("Please provide a frame title");
        return;
    }

    const loadingToastId = toast.loading(editId ? "Updating frame..." : "Publishing frame...");
    try {
      let publicUrl = frameUrl;
      if (frameUrl.startsWith('data:')) {
          const res = await fetch(frameUrl);
          const blob = await res.blob();
          publicUrl = await uploadToCloudinary(blob) || "";
      }

      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/campaigns?id=${editId}` : '/api/campaigns';
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const saveRes = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'x-requester-id': user?.id || ''
        },
        body: JSON.stringify({
            title: newCampaignData.title,
            description: newCampaignData.description,
            slug: newCampaignData.slug,
            frame_url: publicUrl,
            placeholders: placeholders.map(p => ({
                ...p,
                x_pct: p.x / editorDimensions.width,
                y_pct: p.y / editorDimensions.height,
                w_pct: p.width / editorDimensions.width,
                h_pct: p.height / editorDimensions.height
            })),
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
    <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
      <header className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4">
          <Button onClick={onCancel} variant="outline" className="rounded-xl border-gray-200 font-bold"><X size={18} /> Exit</Button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Frame Studio</h2>
        </div>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 font-black flex items-center gap-2"><Save size={18} /> Save Frame</Button>
      </header>

      <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-gray-50 rounded-[2.5rem] flex items-center justify-center p-8 min-h-[500px] border-2 border-dashed border-gray-100">
             {!frameUrl ? (
                <label className="flex flex-col items-center justify-center cursor-pointer group text-center bg-white p-12 rounded-[2rem] shadow-inner">
                    <ImageIcon size={60} className="text-indigo-100 group-hover:text-indigo-600 transition-colors mb-4" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Frame PNG</span>
                    <input type="file" className="hidden" onChange={handleFrameUpload} accept="image/*" />
                </label>
             ) : (
                <div id="editor-container" className="relative bg-white shadow-2xl overflow-hidden rounded-[2rem] mx-auto" style={{ width: `${editorDimensions.width}px`, height: `${editorDimensions.height}px` }}>
                    <img src={frameUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt="Frame" />
                    {placeholders.map((p) => (
                        <Rnd
                            key={p.id}
                            size={{ width: p.width, height: p.height }}
                            position={{ x: p.x, y: p.y }}
                            onDragStop={(e, d) => updatePlaceholder(p.id, { x: d.x, y: d.y })}
                            onResizeStop={(e, dir, ref, delta, pos) => updatePlaceholder(p.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), ...pos })}
                            bounds="parent"
                            onClick={() => setSelectedId(p.id)}
                            className={`z-10 flex items-center justify-center border-2 border-dashed transition-all ${selectedId === p.id ? "border-indigo-600 bg-indigo-50/20" : "border-indigo-200 bg-indigo-50/5 hover:border-indigo-400"}`}
                            style={{ borderRadius: p.type === 'circle' ? '50%' : `${p.borderRadius || 0}px` }}
                        >
                            <div className="text-[8px] font-black text-indigo-400/50 uppercase select-none">{p.type}</div>
                            {selectedId === p.id && <button onClick={(e) => { e.stopPropagation(); setPlaceholders(placeholders.filter(ph => ph.id !== p.id)); setSelectedId(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 active:scale-95"><X size={12} /></button>}
                        </Rnd>
                    ))}
                </div>
             )}
        </div>

        <div className="xl:col-span-4 space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frame Settings</label>
                <input type="text" value={newCampaignData.title} onChange={e => setNewCampaignData(prev => ({...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-")}))} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Frame Name" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <Button onClick={() => addPlaceholder('rectangle')} variant="outline" className="rounded-xl h-12 gap-2 border-gray-200 text-xs font-black"><Square size={16} className="text-indigo-600" /> Photo</Button>
                <Button onClick={() => addPlaceholder('circle')} variant="outline" className="rounded-xl h-12 gap-2 border-gray-200 text-xs font-black"><CircleIcon size={16} className="text-indigo-600" /> Circle</Button>
                <Button onClick={() => addPlaceholder('text')} variant="outline" className="col-span-2 rounded-xl h-12 gap-2 border-gray-200 text-xs font-black"><TypeIcon size={16} className="text-indigo-600" /> Name Field</Button>
            </div>

            {selectedPlaceholder && (
                <div className="space-y-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 mt-6 animate-in slide-in-from-bottom-2">
                    {selectedPlaceholder.type === 'text' ? (
                        <div className="space-y-4">
                            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Field Label</label><input type="text" value={selectedPlaceholder.label} onChange={e => updatePlaceholder(selectedId!, {label: e.target.value})} className="w-full border-none rounded-xl px-4 py-2 font-bold text-sm bg-white shadow-sm" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase">Text Size</label><input type="number" value={selectedPlaceholder.fontSize} onChange={e => updatePlaceholder(selectedId!, {fontSize: parseInt(e.target.value)})} className="w-full border-none rounded-xl px-4 py-2 text-sm bg-white shadow-sm" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase">Color</label><input type="color" value={selectedPlaceholder.color} onChange={e => updatePlaceholder(selectedId!, {color: e.target.value})} className="w-full h-9 border-none bg-white rounded-xl shadow-sm" /></div>
                            </div>
                            <div className="flex gap-1">
                                {(['left', 'center', 'right'] as const).map(a => <Button key={a} size="sm" variant={selectedPlaceholder.textAlign === a ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedId!, {textAlign: a})} className="flex-1 rounded-lg">{a === 'center' ? <AlignCenter size={14} /> : a === 'left' ? <AlignLeft size={14} /> : <AlignRight size={14} />}</Button>)}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Dimensions: {Math.round(selectedPlaceholder.width)}x{Math.round(selectedPlaceholder.height)}</p>
                            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hole Shape</label><div className="flex gap-2"><Button size="sm" variant={selectedPlaceholder.type === 'rectangle' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedId!, {type: 'rectangle'})} className="flex-1 rounded-xl">Square</Button><Button size="sm" variant={selectedPlaceholder.type === 'circle' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedId!, {type: 'circle'})} className="flex-1 rounded-xl">Circle</Button></div></div>
                            {selectedPlaceholder.type === 'rectangle' && <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Corner Rounding</label><input type="range" min="0" max="100" value={selectedPlaceholder.borderRadius} onChange={e => updatePlaceholder(selectedId!, {borderRadius: parseInt(e.target.value)})} className="w-full accent-indigo-600" /></div>}
                        </div>
                    )}
                    <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 font-black text-xs gap-2" onClick={() => { setPlaceholders(placeholders.filter(p => p.id !== selectedId)); setSelectedId(null); }}><Trash2 size={14} /> Delete Hole</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
