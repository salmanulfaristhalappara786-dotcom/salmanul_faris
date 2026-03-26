import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { 
  Plus, Square, Circle as CircleIcon, Type as TypeIcon, Save, X, 
  Trash2, Image as ImageIcon, AlignCenter, AlignLeft, AlignRight,
  Bold, Italic, Underline, Upload, Eraser, ChevronDown, Layout
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
  previewText?: string;
  fontSize?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: number;
  italic?: boolean;
  underline?: boolean;
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
      label: type === 'text' ? 'Full Name' : 'Photo Placeholder',
      previewText: type === 'text' ? 'John Doe' : '',
      fontSize: 18, color: '#000000', textAlign: 'center', borderRadius: 0,
      lineHeight: 1.4, fontWeight: 'normal'
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

  const clearCanvas = () => {
    if (window.confirm("Are you sure you want to clear all elements?")) {
        setPlaceholders([]);
        setSelectedId(null);
    }
  };

  const selectedPlaceholder = placeholders.find(p => p.id === selectedId);

  return (
    <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[800px]">
      {/* Canvas Area */}
      <div className="flex-1 bg-gray-50/50 p-12 flex flex-col items-center justify-center relative border-r border-gray-50">
         <div className="absolute top-8 left-8 flex items-center gap-4">
           <Button onClick={onCancel} variant="ghost" className="rounded-2xl text-gray-400 hover:text-gray-900 font-bold h-12 gap-2"><X size={20} /> Exit Studio</Button>
           <h2 className="text-xl font-black text-gray-900 tracking-tight">Frame Studio <span className="text-indigo-600">.</span></h2>
         </div>

         {!frameUrl ? (
            <label className="flex flex-col items-center justify-center cursor-pointer group text-center bg-white p-20 rounded-[4rem] shadow-xl border-2 border-dashed border-indigo-100 hover:border-indigo-400 transition-all max-w-md w-full">
                <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100/50">
                  <ImageIcon size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Upload Frame</h3>
                <p className="text-gray-400 font-medium text-sm mb-6">Select a transparent PNG template.</p>
                <div className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs">Browse Files</div>
                <input type="file" className="hidden" onChange={handleFrameUpload} accept="image/*" />
            </label>
         ) : (
            <div id="editor-container" className="relative bg-white shadow-2xl overflow-hidden rounded-[2.5rem] border-4 border-white mx-auto transition-all" style={{ width: `${editorDimensions.width}px`, height: `${editorDimensions.height}px` }}>
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
                        className={`z-10 flex items-center justify-center border-2 border-dashed transition-all ${selectedId === p.id ? "border-indigo-600 bg-indigo-50/30" : "border-indigo-200 bg-indigo-50/5 hover:border-indigo-400"}`}
                        style={{ borderRadius: p.type === 'circle' ? '50%' : `${p.borderRadius || 0}px` }}
                    >
                        {p.type === 'text' ? (
                            <div className="text-center w-full px-2 truncate pointer-events-none" style={{ 
                                fontSize: `${p.fontSize}px`, 
                                color: p.color, 
                                textAlign: p.textAlign,
                                fontWeight: p.fontWeight === 'bold' ? 'bold' : 'normal',
                                fontStyle: p.italic ? 'italic' : 'normal',
                                textDecoration: p.underline ? 'underline' : 'none'
                             }}>
                                {p.previewText || p.label}
                            </div>
                        ) : (
                            <div className="text-[10px] font-black text-indigo-400/50 uppercase select-none">{p.type === 'circle' ? 'Circle' : 'Photo'}</div>
                        )}
                        {selectedId === p.id && <button onClick={(e) => { e.stopPropagation(); setPlaceholders(placeholders.filter(ph => ph.id !== p.id)); setSelectedId(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 active:scale-95 z-20"><X size={12} /></button>}
                    </Rnd>
                ))}
            </div>
         )}
      </div>

      {/* Sidebar Controls (Matching Screenshot Aesthetic) */}
      <aside className="w-full md:w-[400px] p-10 bg-white overflow-y-auto max-h-screen">
        <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
          Frame Settings
        </h3>

        <div className="space-y-8">
            {/* Elements Section */}
            <div className="space-y-4">
                <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-1">Elements</label>
                <div className="space-y-3">
                    <Button onClick={() => addPlaceholder('rectangle')} className="w-full bg-[#1BC466] hover:bg-[#18ae5a] h-14 rounded-2xl text-white font-black flex items-center justify-between px-8 shadow-lg shadow-green-100 transition-all active:scale-95 group">
                        <div className="flex items-center gap-3"><Square size={20} /> Add Placeholder</div>
                        <ChevronDown size={20} className="text-white/70 group-hover:translate-y-0.5 transition-transform" />
                    </Button>
                    <Button onClick={() => addPlaceholder('text')} className="w-full bg-[#00A3FF] hover:bg-[#0091e6] h-14 rounded-2xl text-white border-2 border-[#00A3FF] font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-100 transition-all active:scale-95">
                        <TypeIcon size={20} /> Add Text Field
                    </Button>
                </div>
            </div>

            {selectedPlaceholder ? (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="h-px bg-gray-100 w-full"></div>

                  {/* Dynamic Editing Panel */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{selectedPlaceholder.type === 'text' ? 'Text Editing' : 'Placeholder Styling'}</label>
                    
                    {selectedPlaceholder.type === 'text' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 ml-1">Label (shown to users)</label>
                                <input type="text" value={selectedPlaceholder.label} onChange={e => updatePlaceholder(selectedId!, {label: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all border-none" placeholder="e.g. Your Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 ml-1">Preview Text</label>
                                <input type="text" value={selectedPlaceholder.previewText} onChange={e => updatePlaceholder(selectedId!, {previewText: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all border-none" placeholder="e.g. Salmanul Faris" />
                            </div>
                            <div className="grid grid-cols-6 gap-3 pt-2">
                                <div className="col-span-3 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Font</label>
                                    <select className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm appearance-none outline-none focus:ring-4 focus:ring-indigo-100 border-none transition-all cursor-pointer">
                                        <option>Arial</option>
                                        <option>Inter</option>
                                        <option>Poppins</option>
                                        <option>Malayalam</option>
                                    </select>
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Color</label>
                                    <div className="relative group overflow-hidden rounded-xl border-none">
                                        <input type="color" value={selectedPlaceholder.color} onChange={e => updatePlaceholder(selectedId!, {color: e.target.value})} className="w-full h-[46px] p-0 border-none bg-gray-50 cursor-pointer scale-150 transition-all" />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Size</label>
                                    <input type="number" value={selectedPlaceholder.fontSize} onChange={e => updatePlaceholder(selectedId!, {fontSize: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-3 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 border-none no-spinner" />
                                </div>
                            </div>
                            
                            {/* Formatting Buttons */}
                            <div className="flex gap-2">
                                <button onClick={() => updatePlaceholder(selectedId!, { fontWeight: selectedPlaceholder.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.fontWeight === 'bold' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <Bold size={18} /> </button>
                                <button onClick={() => updatePlaceholder(selectedId!, { italic: !selectedPlaceholder.italic })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.italic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <Italic size={18} /> </button>
                                <button onClick={() => updatePlaceholder(selectedId!, { underline: !selectedPlaceholder.underline })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.underline ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <Underline size={18} /> </button>
                                <button onClick={() => updatePlaceholder(selectedId!, { textAlign: 'left' })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.textAlign === 'left' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <AlignLeft size={18} /> </button>
                                <button onClick={() => updatePlaceholder(selectedId!, { textAlign: 'center' })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.textAlign === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <AlignCenter size={18} /> </button>
                                <button onClick={() => updatePlaceholder(selectedId!, { textAlign: 'right' })} className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${selectedPlaceholder.textAlign === 'right' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> <AlignRight size={18} /> </button>
                            </div>
                        </>
                    )}

                    {/* Common Size/Pos Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1">Width</label>
                            <input type="number" value={Math.round(selectedPlaceholder.width)} onChange={e => updatePlaceholder(selectedId!, {width: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none border-none focus:ring-4 focus:ring-indigo-100" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1">Height</label>
                            <input type="number" value={Math.round(selectedPlaceholder.height)} onChange={e => updatePlaceholder(selectedId!, {height: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none border-none focus:ring-4 focus:ring-indigo-100" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1">X Position</label>
                            <input type="number" value={Math.round(selectedPlaceholder.x)} onChange={e => updatePlaceholder(selectedId!, {x: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none border-none focus:ring-4 focus:ring-indigo-100" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1">Y Position</label>
                            <input type="number" value={Math.round(selectedPlaceholder.y)} onChange={e => updatePlaceholder(selectedId!, {y: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none border-none focus:ring-4 focus:ring-indigo-100" />
                        </div>
                    </div>

                    {selectedPlaceholder.type === 'text' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1">Line Height (spacing)</label>
                            <input type="number" step="0.1" value={selectedPlaceholder.lineHeight} onChange={e => updatePlaceholder(selectedId!, {lineHeight: parseFloat(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none border-none focus:ring-4 focus:ring-indigo-100" />
                        </div>
                    )}

                    <Button onClick={() => { setPlaceholders(placeholders.filter(p => p.id !== selectedId)); setSelectedId(null); }} className="w-full bg-[#EB4034] hover:bg-[#d0352a] h-14 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-lg shadow-red-100 transition-all mt-4">
                        <Trash2 size={20} /> Delete Selection
                    </Button>
                  </div>

                  <div className="h-px bg-gray-100 w-full"></div>
               </div>
            ) : (
                <div className="py-12 text-center text-gray-300 flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Layout size={20} className="text-gray-200" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Select an element to edit</p>
                </div>
            )}

            {/* Global Actions */}
            <div className="space-y-6 pt-6">
                <Button onClick={() => toast.info("Custom font upload coming soon!")} variant="outline" className="w-full h-14 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                    <Upload size={20} /> Add Font
                </Button>

                <div className="h-px bg-gray-100 w-full mb-8"></div>

                <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Actions</label>
                    <div className="space-y-3">
                        <Button onClick={clearCanvas} className="w-full bg-[#EB4034] hover:bg-[#d0352a] h-14 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-lg shadow-red-100 transition-all active:scale-95">
                            <Eraser size={20} /> Clear Canvas
                        </Button>
                        <Button onClick={handleSave} className="w-full bg-[#5C55F2] hover:bg-[#4b43d6] h-14 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                            <Save size={20} /> Save Frame
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
};
