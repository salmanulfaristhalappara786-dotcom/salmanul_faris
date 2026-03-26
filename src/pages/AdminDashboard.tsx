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
import { FrameEditor, Placeholder } from "@/components/FrameEditor";

// Removed redundant Placeholder interface as it is now imported from FrameEditor

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
  const [editId, setEditId] = useState<string | null>(null);

  const [siteSettings, setSiteSettings] = useState<{ hero_images: string[], about_images: string[] }>({ hero_images: [], about_images: [] });

  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes, urRes, stRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/submissions'),
        fetch('/api/user-requests'),
        fetch('/api/settings')
      ]);
      
      const campaigns = await cRes.json();
      const subs = await sRes.json();
      const requests = await urRes.json();
      const settings = await stRes.json();
      
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
      if (settings && !settings.error) setSiteSettings(settings);

    } catch (err) {
      console.error("Fetch Data failed", err);
    }
  }, []);

  const handleSiteUpload = async (type: 'hero' | 'about') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const toastId = toast.loading("Uploading to Cloudinary...");
        try {
            const url = await uploadToCloudinary(file);
            if (!url) throw new Error("Upload failed");
            const updated = { ...siteSettings };
            if (type === 'hero') updated.hero_images = [...updated.hero_images, url];
            else updated.about_images = [...updated.about_images, url];
            
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setSiteSettings(updated);
            toast.dismiss(toastId);
            toast.success("Site updated successfully!");
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Failed to update site assets.");
        }
    };
    input.click();
  };

  useEffect(() => {
    // ... rest of logic
    if (!authLoading) {
        if (!user || user.role !== 'admin') {
            navigate("/admin/login");
        } else {
            fetchData();
            
            // Handle edit parameter
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('edit');
            if (editId) {
                setEditId(editId);
                fetch(`/api/campaigns?id=${editId}`).then(r => r.json()).then(data => {
                    if (data && !data.error) {
                        setCampaignTitle(data.title);
                        setFrameImage(data.frame_url);
                        setPlaceholders(data.placeholders || []);
                        setActiveTab("create");
                    }
                });
            }
        }
    }
  }, [user, authLoading, navigate, fetchData]);

  if (authLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-indigo-600 font-black">AUTHENTICATING...</div>;
  
  return (
    <div className="flex h-screen bg-[#FDFEFF]">
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-50 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 z-[100] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shadow-xl" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Admin</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"><X size={24} /></button>
          </div>
          <nav className="space-y-1">
            {user?.role === 'admin' && !window.location.pathname.startsWith("/studio") && (
              <>
                <button onClick={() => { setActiveTab("dash"); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "dash" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><LayoutDashboard size={20} /> Overview</button>
                <button onClick={() => { setActiveTab("approval"); setSidebarOpen(false); }} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "approval" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><div className="flex items-center gap-4"><ShieldCheck size={20} /> Approvals</div> {pendingCampaigns.length > 0 && <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full">{pendingCampaigns.length}</span>}</button>
                <button onClick={() => { setActiveTab("users"); setSidebarOpen(false); }} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "users" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><div className="flex items-center gap-4"><UserCheck size={20} /> User Requests</div> {userRequests.filter(r => r.status === 'pending').length > 0 && <span className="bg-amber-500 text-white text-[8px] px-2 py-1 rounded-full">{userRequests.filter(r => r.status === 'pending').length}</span>}</button>
                <button onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><Palette size={20} /> Manage Site</button>
              </>
            )}
            <button onClick={() => { setActiveTab("create"); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "create" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><ImageIcon size={20} /> Create Frame</button>
            <button onClick={() => { setActiveTab("gallery"); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === "gallery" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}><Plus size={20} className="rotate-45" /> All Frames</button>
          </nav>
        </div>
        <div className="mt-auto p-10 border-t border-gray-50"><button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all"><LogOut size={20} /> Logout</button></div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <main className="flex-1 overflow-y-auto bg-[#FDFEFF]">
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 px-6 md:px-12 py-6 md:py-8 flex items-center justify-between z-10 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"><Menu size={24} /></button>
            <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">{activeTab === "create" ? "Frame Studio" : activeTab === "gallery" ? "All Content Library" : "Admin Insights"}</h2>
          </div>
          <div className="flex gap-4">
             {/* Save button is now inside FrameEditor */}
          </div>
        </header>

        <div className="p-6 md:p-12">
          {activeTab === "create" ? (
             <FrameEditor 
                key={editId || 'new'}
                editId={editId}
                initialData={editId ? {
                    title: campaignTitle,
                    frame_url: frameImage!,
                    placeholders: placeholders
                } : null}
                onSaveSuccess={() => {
                    setEditId(null);
                    setFrameImage(null);
                    setPlaceholders([]);
                    fetchData();
                    setActiveTab("dash");
                }}
                onCancel={() => {
                    setEditId(null);
                    setFrameImage(null);
                    setPlaceholders([]);
                    setActiveTab("dash");
                }}
             />
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
                                <Button onClick={() => { setEditId(camp._id); setCampaignTitle(camp.title); setFrameImage(camp.frame_url); setPlaceholders(camp.placeholders || []); setActiveTab("create"); }} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 h-12 rounded-xl text-[10px] font-black uppercase">Edit Frame</Button>
                                <Button onClick={async () => { if(confirm("Delete this campaign?")) { await fetch(`/api/campaigns?id=${camp._id}`, { method: 'DELETE', headers: { 'x-requester-id': user!.id, 'x-requester-role': user!.role || 'user' } }); toast.success("Campaign Deleted"); fetchData(); } }} variant="outline" className="h-12 w-12 rounded-xl text-red-500 border-gray-50 flex items-center justify-center"><Trash2 size={18} /></Button>
                            </div>
                        </div>
                    </div>
                ))}
                {allCampaigns.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">No campaigns found</div>}
             </div>
          ) : activeTab === "settings" ? (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Home Hero Slider</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Main banner images on landing page</p>
                        </div>
                        <Button onClick={() => handleSiteUpload('hero')} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black text-xs gap-3 shadow-xl shadow-indigo-100">
                             <Plus size={20} /> Add Hero Image
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {siteSettings.hero_images.map((img, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden relative group border border-gray-100 shadow-sm">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hero" />
                                <button 
                                    onClick={async () => {
                                        const updated = { ...siteSettings, hero_images: siteSettings.hero_images.filter((_, idx) => idx !== i) };
                                        await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
                                        setSiteSettings(updated);
                                        toast.success("Image removed");
                                    }}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">About Page Slider</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Personal gallery on about section</p>
                        </div>
                        <Button onClick={() => handleSiteUpload('about')} className="bg-purple-600 hover:bg-purple-700 h-14 px-8 rounded-2xl font-black text-xs gap-3 shadow-xl shadow-purple-100">
                             <Plus size={20} /> Add About Image
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {siteSettings.about_images.map((img, i) => (
                            <div key={i} className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative group border border-gray-100 shadow-sm">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="About" />
                                <button 
                                    onClick={async () => {
                                        const updated = { ...siteSettings, about_images: siteSettings.about_images.filter((_, idx) => idx !== i) };
                                        await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
                                        setSiteSettings(updated);
                                        toast.success("Image removed");
                                    }}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
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

      {/* Removed Redundant Modal */}
    </div>
  );
};

export default AdminDashboard;
