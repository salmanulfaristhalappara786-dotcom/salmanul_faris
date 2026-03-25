import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Plus, Image as ImageIcon, LogOut, Palette, Type as TypeIcon,
  Settings2, X, Edit3, Menu, Check, CheckCircle, Clock, ShieldCheck, Mail, Phone, UserCheck,
  AlignLeft, AlignCenter, AlignRight, Save, Square, Circle as CircleIcon, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/context/AuthContext";

interface Placeholder {
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [frameImage, setFrameImage] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [campaignTitle, setCampaignTitle] = useState("New Campaign");
  const [activeTab, setActiveTab] = useState("dash");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<{ name: string, value: string, fontUrl?: string }[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ campaigns: 0, submissions: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ title: "", description: "", slug: "" });

  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes, urRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/submissions'),
        fetch('/api/user-requests')
      ]);
      
      const campaigns = await cRes.json();
      const subs = await sRes.json();
      const requests = await urRes.json();
      
      if (Array.isArray(campaigns)) {
          setAllCampaigns(campaigns);
          setPendingCampaigns(campaigns.filter(c => c.status === 'pending'));
          setStats(prev => ({ ...prev, campaigns: campaigns.length }));
      }
      if (Array.isArray(subs)) {
          setSubmissions(subs);
          setStats(prev => ({ ...prev, submissions: subs.length }));
      }
      if (Array.isArray(requests)) setUserRequests(requests);

    } catch (err) {
      console.error("Fetch Data failed", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
        if (!user || user.role !== 'admin') {
            navigate("/admin/login");
        } else {
            fetchData();
        }
    }
  }, [user, authLoading, navigate, fetchData]);

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

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    setSelectedId(id);
    setIsDragging(true);
    setDragOffset({ x: e.clientX, y: e.clientY });
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

  const startResizing = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsResizing(true);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const deletePlaceholder = (id: string) => {
    setPlaceholders(placeholders.filter(p => p.id !== id));
    setSelectedId(null);
  };

  const updatePlaceholder = (id: string, updates: Partial<Placeholder>) => {
    setPlaceholders(placeholders.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSave = async () => {
    if (!frameImage) return toast.error("Upload a frame image first.");
    setNewCampaignData({ title: campaignTitle, description: "Share your voice.", slug: campaignTitle.toLowerCase().replace(/ /g, "-") });
    setIsModalOpen(true);
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

  const finalizeSave = async () => {
    const loadingToastId = toast.loading("Saving campaign...");
    try {
      if (!frameImage) throw new Error("No frame image found.");
      const blob = dataURLtoBlob(frameImage);
      const publicUrl = await uploadToCloudinary(blob, (p) => toast.loading(`Uploading... ${p}%`, { id: loadingToastId }));
      
      if (!publicUrl) throw new Error("Upload failed.");

      const saveRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!saveRes.ok) {
        const errorMsg = await saveRes.text();
        console.error("API Error:", errorMsg);
        throw new Error(`Server responded with ${saveRes.status}`);
      }
      
      toast.dismiss(loadingToastId);
      toast.success("Campaign Published!");
      setIsModalOpen(false);
      setActiveTab("dash");
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-indigo-600 font-black">AUTHENTICATING...</div>;
  
  const selectedPlaceholder = placeholders.find(p => p.id === selectedId);

  return (
    <div className="flex h-screen bg-[#FDFEFF]">
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-50 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-10">
          <div className="flex items-center gap-4 mb-12">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shadow-xl" />
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Admin</h2>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab("dash")} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "dash" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><LayoutDashboard size={20} /> Overview</button>
            <button onClick={() => setActiveTab("create")} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "create" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><ImageIcon size={20} /> Create Frame</button>
            <button onClick={() => setActiveTab("approval")} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "approval" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><div className="flex items-center gap-4"><ShieldCheck size={20} /> Approvals</div> {pendingCampaigns.length > 0 && <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full">{pendingCampaigns.length}</span>}</button>
            <button onClick={() => setActiveTab("gallery")} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "gallery" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><Plus size={20} className="rotate-45" /> Gallery</button>
            <button onClick={() => setActiveTab("users")} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "users" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><div className="flex items-center gap-4"><UserCheck size={20} /> User Requests</div> {userRequests.filter(r => r.status === 'pending').length > 0 && <span className="bg-amber-500 text-white text-[8px] px-2 py-1 rounded-full">{userRequests.filter(r => r.status === 'pending').length}</span>}</button>
          </nav>
        </div>
        <div className="mt-auto p-10 border-t border-gray-50"><button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all"><LogOut size={20} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#FDFEFF]">
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 px-12 py-8 flex items-center justify-between z-10 border-b border-gray-50">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">{activeTab === "create" ? "Frame Studio" : "Admin Insights"}</h2>
          <div className="flex gap-4">
             <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-8 py-4 font-black shadow-xl flex items-center gap-2"><Save size={20} /> Push Campaign</Button>
          </div>
        </header>

        <div className="p-12">
          {activeTab === "create" ? (
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                <div className="xl:col-span-8 bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden relative">
                    <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center"><span className="text-[10px] font-black tracking-widest text-gray-400">CANVAS VIEW</span><button onClick={() => {setFrameImage(null); setPlaceholders([]);}} className="text-gray-400 hover:text-red-500"><X size={18} /></button></div>
                    <div className="aspect-square flex items-center justify-center p-12 relative">
                        <div ref={containerRef} className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 w-full max-w-[600px] aspect-square" onMouseMove={handleMouseMove} onMouseUp={() => {setIsDragging(false); setIsResizing(false);}}>
                            {frameImage ? <img src={frameImage} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" /> : <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"><ImageIcon size={40} className="text-gray-200 group-hover:text-indigo-600 transition-colors" /><span className="mt-4 text-[10px] font-black text-gray-300">UPLOAD FRAME PNG</span><input type="file" className="hidden" onChange={handleFrameUpload} accept="image/*" /></label>}
                            {placeholders.map(p => (
                                <div key={p.id} className="absolute group z-20" style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
                                    <div onMouseDown={(e) => handleMouseDown(e, p.id)} className={`w-full h-full flex items-center justify-center transition-all ${selectedId === p.id ? 'ring-4 ring-indigo-500/30 border-2 border-indigo-600 shadow-xl' : 'border border-dashed border-gray-300'}`} style={{ borderRadius: p.type === 'circle' ? '50%' : '12px', backgroundColor: p.type === 'text' ? 'transparent' : 'rgba(99, 102, 241, 0.15)' }}>
                                        {p.type === 'text' ? (
                                          <span style={{ 
                                            fontSize: p.fontSize, 
                                            fontFamily: p.fontFamily, 
                                            color: p.color, 
                                            textAlign: p.textAlign,
                                            fontWeight: p.fontWeight,
                                            fontStyle: p.fontStyle,
                                            textDecoration: p.textDecoration,
                                            lineHeight: p.lineHeight
                                          }}>{p.previewText || p.label}</span>
                                        ) : (
                                          <span className="text-[8px] font-black text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full">{p.type.toUpperCase()}</span>
                                        )}
                                    </div>
                                    {selectedId === p.id && <button onClick={() => deletePlaceholder(p.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-30"><X size={12} /></button>}
                                    {selectedId === p.id && <div onMouseDown={(e) => startResizing(e, p.id)} className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-sm cursor-nwse-resize shadow-md z-30" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-4 space-y-8">
                   <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 p-10 space-y-10">
                      <div className="space-y-4">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Campaign Title</label>
                         <input type="text" value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         <Button onClick={() => addPlaceholder('rectangle')} variant="outline" className="h-24 flex-col rounded-2xl border-2 border-gray-50 hover:bg-indigo-50 font-black text-[8px] tracking-widest"><Square size={24} /> RECTANGLE</Button>
                         <Button onClick={() => addPlaceholder('circle')} variant="outline" className="h-24 flex-col rounded-2xl border-2 border-gray-50 hover:bg-green-50 font-black text-[8px] tracking-widest"><CircleIcon size={24} /> CIRCLE</Button>
                         <Button onClick={() => addPlaceholder('text')} variant="outline" className="h-24 flex-col rounded-2xl border-2 border-gray-50 hover:bg-purple-50 font-black text-[8px] tracking-widest"><TypeIcon size={24} /> TEXT</Button>
                      </div>
                      {selectedPlaceholder && (
                         <div className="space-y-6 pt-10 border-t border-gray-50 animate-in slide-in-from-bottom-2">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Element Settings</h4>
                            
                            {selectedPlaceholder.type === 'text' && (
                              <>
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Label (shown to users)</label>
                                  <input type="text" value={selectedPlaceholder.label} onChange={e => updatePlaceholder(selectedPlaceholder.id, { label: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="Text Label" />
                                </div>

                                <div className="space-y-4">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview Text</label>
                                  <input type="text" value={selectedPlaceholder.previewText} onChange={e => updatePlaceholder(selectedPlaceholder.id, { previewText: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="Sample Text" />
                                </div>
                                
                                <div className="flex gap-4">
                                  <div className="flex-1 capitalize text-[10px] font-black text-gray-400">Font 
                                    <select value={selectedPlaceholder.fontFamily} onChange={e => updatePlaceholder(selectedPlaceholder.id, { fontFamily: e.target.value })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold">{initialFonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}</select>
                                  </div>
                                  <div className="w-16 capitalize text-[10px] font-black text-gray-400">Color 
                                    <input type="color" value={selectedPlaceholder.color} onChange={e => updatePlaceholder(selectedPlaceholder.id, { color: e.target.value })} className="w-full mt-1 h-11 p-1 bg-white border border-gray-100 rounded-xl cursor-pointer shadow-sm" />
                                  </div>
                                  <div className="w-20 capitalize text-[10px] font-black text-gray-400">Size 
                                    <input type="number" value={selectedPlaceholder.fontSize} onChange={e => updatePlaceholder(selectedPlaceholder.id, { fontSize: parseInt(e.target.value) })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-6 gap-2">
                                  <Button size="sm" variant={selectedPlaceholder.fontWeight === 'bold' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { fontWeight: selectedPlaceholder.fontWeight === 'bold' ? 'normal' : 'bold' })} className="h-10 font-bold px-0"><span className="text-sm">B</span></Button>
                                  <Button size="sm" variant={selectedPlaceholder.fontStyle === 'italic' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { fontStyle: selectedPlaceholder.fontStyle === 'italic' ? 'normal' : 'italic' })} className="h-10 italic px-0"><span className="text-sm">I</span></Button>
                                  <Button size="sm" variant={selectedPlaceholder.textDecoration === 'underline' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { textDecoration: selectedPlaceholder.textDecoration === 'underline' ? 'none' : 'underline' })} className="h-10 underline px-0"><span className="text-sm">U</span></Button>
                                  <Button size="sm" variant={selectedPlaceholder.textAlign === 'left' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { textAlign: 'left' })} className="h-10 px-0"><AlignLeft size={16} /></Button>
                                  <Button size="sm" variant={selectedPlaceholder.textAlign === 'center' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { textAlign: 'center' })} className="h-10 px-0"><AlignCenter size={16} /></Button>
                                  <Button size="sm" variant={selectedPlaceholder.textAlign === 'right' ? 'default' : 'outline'} onClick={() => updatePlaceholder(selectedPlaceholder.id, { textAlign: 'right' })} className="h-10 px-0"><AlignRight size={16} /></Button>
                                </div>
                              </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="capitalize text-[10px] font-black text-gray-400">Width 
                                  <input type="number" value={selectedPlaceholder.width} onChange={e => updatePlaceholder(selectedPlaceholder.id, { width: parseInt(e.target.value) })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm" />
                                </div>
                                <div className="capitalize text-[10px] font-black text-gray-400">Height 
                                  <input type="number" value={selectedPlaceholder.height} onChange={e => updatePlaceholder(selectedPlaceholder.id, { height: parseInt(e.target.value) })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="capitalize text-[10px] font-black text-gray-400">X Position 
                                  <input type="number" value={Math.round(selectedPlaceholder.x)} onChange={e => updatePlaceholder(selectedPlaceholder.id, { x: parseInt(e.target.value) })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm" />
                                </div>
                                <div className="capitalize text-[10px] font-black text-gray-400">Y Position 
                                  <input type="number" value={Math.round(selectedPlaceholder.y)} onChange={e => updatePlaceholder(selectedPlaceholder.id, { y: parseInt(e.target.value) })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm" />
                                </div>
                            </div>

                            {selectedPlaceholder.type === 'text' && (
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Height (spacing)</label>
                                <input type="number" step="0.1" value={selectedPlaceholder.lineHeight} onChange={e => updatePlaceholder(selectedPlaceholder.id, { lineHeight: parseFloat(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm" />
                              </div>
                            )}

                            <Button onClick={() => deletePlaceholder(selectedPlaceholder.id)} className="w-full h-12 bg-red-50 text-red-500 hover:bg-red-100 border-none rounded-2xl font-black flex items-center gap-2"><Trash2 size={16} /> Delete Element</Button>
                         </div>
                      )}
                      
                      <div className="pt-6 flex flex-col gap-3">
                        <Button onClick={() => {setFrameImage(null); setPlaceholders([]);}} variant="outline" className="w-full h-14 rounded-2xl border-2 border-red-50 text-red-500 font-black">Clear Canvas</Button>
                        <Button onClick={handleSave} className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100">Save Frame</Button>
                      </div>
                   </div>
                </div>
             </div>
          ) : activeTab === "dash" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in fade-in duration-500">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-indigo-100/20 border border-gray-50 group hover:scale-[1.02] transition-transform"><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Campaigns</h4><div className="flex items-center gap-6"><div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><ImageIcon size={30} /></div><span className="text-6xl font-black text-gray-900">{stats.campaigns}</span></div></div>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-purple-100/20 border border-gray-50 group hover:scale-[1.02] transition-transform"><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Submissions</h4><div className="flex items-center gap-6"><div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Plus size={30} className="rotate-45" /></div><span className="text-6xl font-black text-gray-900">{stats.submissions}</span></div></div>
             </div>
          ) : activeTab === "gallery" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allCampaigns.map((camp: any) => (
                    <div key={camp._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="aspect-square relative overflow-hidden">
                            <img src={camp.frame_url} alt={camp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-indigo-100">{camp.status}</div>
                        </div>
                        <div className="p-8">
                            <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{camp.title}</h4>
                            <p className="text-gray-400 text-xs font-bold mb-6 truncate">URL: /{camp.slug}</p>
                            <div className="flex gap-2">
                                <Button onClick={() => { setCampaignTitle(camp.title); setFrameImage(camp.frame_url); setPlaceholders(camp.placeholders || []); setActiveTab("create"); }} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 h-12 rounded-xl text-[10px] font-black uppercase">Edit Frame</Button>
                                <Button onClick={async () => { if(confirm("Delete this campaign?")) { await fetch(`/api/campaigns?id=${camp._id}`, { method: 'DELETE' }); toast.success("Campaign Deleted"); fetchData(); } }} variant="outline" className="h-12 w-12 rounded-xl text-red-500 border-gray-50 flex items-center justify-center"><Trash2 size={18} /></Button>
                            </div>
                        </div>
                    </div>
                ))}
                {allCampaigns.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">No campaigns found</div>}
             </div>
          ) : activeTab === "users" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userRequests.map((req: any) => (
                    <div key={req._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 group">
                        <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">{req.username[0].toUpperCase()}</div><div><h4 className="font-black text-xl text-gray-900 leading-tight">@{req.username}</h4><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{req.status}</span></div></div>
                        <div className="space-y-3 mb-8 text-gray-500"><div className="flex items-center gap-2 text-xs font-bold"><Mail size={14} /> {req.gmail}</div><div className="flex items-center gap-2 text-xs font-bold"><Phone size={14} /> {req.phone}</div></div>
                        <div className="flex gap-2">
                           {req.status === 'pending' && <Button onClick={async () => { await fetch(`/api/user-requests?id=${req._id}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: 'approved'}) }); toast.success("Approved!"); fetchData(); }} className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl text-[10px] font-black uppercase">Approve</Button>}
                           <Button onClick={async () => { if(confirm("Delete request?")) { await fetch(`/api/user-requests?id=${req._id}`, { method: 'DELETE' }); fetchData(); } }} variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase border-gray-50 text-red-500">Delete</Button>
                        </div>
                    </div>
                ))}
                {userRequests.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">No user requests found</div>}
             </div>
          ) : null}
        </div>
      </main>

      {/* Save Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X size={24} /></button>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Push to Live Server</h3>
                <p className="text-gray-500 font-medium mb-10">Choose a unique slug and confirm title for publishing.</p>
                <div className="space-y-6">
                   <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label><input type="text" value={newCampaignData.title} onChange={e => setNewCampaignData({...newCampaignData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Slug</label><input type="text" value={newCampaignData.slug} onChange={e => setNewCampaignData({...newCampaignData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold" /></div>
                   <Button onClick={finalizeSave} className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-xl font-black rounded-3xl mt-6 shadow-2xl">PUBLISH LIVE NOW</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
