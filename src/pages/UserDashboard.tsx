import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon, Mail, Phone, UserCheck, Clock, ShieldCheck,
  LayoutDashboard, Plus, Image as ImageIcon, LogOut,
  CheckCircle, XCircle, Trash2, Edit3, Palette, Layout
} from "lucide-react";
import { FrameEditor, Placeholder } from "@/components/FrameEditor";

interface ProfileRequest {
  id: string;
  username: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  frame_url: string;
  status: string;
  owner_id: string;
  placeholders: Placeholder[];
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileRequest, setProfileRequest] = useState<ProfileRequest | null>(null);
  
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'my'>('overview');

  const [formData, setFormData] = useState({
    username: "",
    gmail: "",
    phone: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editCampaignData, setEditCampaignData] = useState<Campaign | null>(null);

  const fetchProfileAndData = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const pRes = await fetch(`/api/user-requests?user_id=${userId}`);
      const profile = await pRes.json();

      if (profile && !profile.error) {
          setProfileRequest({
            id: profile._id,
            username: profile.username,
            gmail: profile.gmail,
            phone: profile.phone,
            status: profile.status,
          });
          
          if (profile.status === 'approved') {
            const cRes = await fetch(`/api/campaigns`);
            const campaigns = await cRes.json();
            if (Array.isArray(campaigns)) {
                setAllCampaigns(campaigns);
            }
          }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
        if (!user) {
            navigate("/login");
        } else {
            setFormData(prev => ({ ...prev, gmail: user.email }));
            fetchProfileAndData(user.id);
        }
    }
  }, [user, authLoading, navigate, fetchProfileAndData]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const loadingToast = toast.loading("Submitting membership request...");
      const res = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: formData.username,
          gmail: formData.gmail,
          phone: formData.phone,
          status: 'pending'
        })
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.error) throw new Error(data.error);
      toast.success("Request sent! Waiting for admin approval.");
      setProfileRequest({
        id: data._id,
        username: data.username,
        gmail: data.gmail,
        phone: data.phone,
        status: data.status,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profileRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-xl">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50">
                <UserCheck size={40} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Join the Studio</h2>
            <p className="text-gray-500 mb-10 font-medium">To create and manage campaign frames, please submit your details for admin approval.</p>
            <form className="space-y-6 text-left" onSubmit={handleSubmitRequest}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <UserIcon size={14} className="text-indigo-600" /> Username
                  </label>
                  <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-900" placeholder="faris_v" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Mail size={14} className="text-indigo-600" /> Gmail
                  </label>
                  <input type="email" required readOnly value={formData.gmail} className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-6 py-5 text-gray-400 cursor-not-allowed font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone size={14} className="text-indigo-600" /> Phone Number
                </label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-900" placeholder="+91 0000 0000 00" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-20 rounded-3xl text-xl font-black shadow-2xl shadow-indigo-100 mt-6 transition-all hover:scale-[1.02]">
                Submit Membership Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (profileRequest.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4 text-center">
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-gray-50 max-w-2xl w-full">
          <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-10 animate-pulse">
            <Clock size={50} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Pending Approval</h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10 px-8">
            Hello, <span className="text-indigo-600 font-black">@{profileRequest.username}</span>! Your request is currently being reviewed by the admin.
          </p>
        </div>
      </div>
    );
  }

  const myCampaigns = allCampaigns.filter(c => c.owner_id === user?.id);
  const myFramesCount = myCampaigns.length;

  const SidebarBtn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full h-14 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center border-2 ${active ? 'bg-[#7BB0E8] text-gray-900 border-[#7BB0E8]' : 'bg-white text-gray-400 border-gray-50 hover:border-indigo-200'}`}>
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex">
      {/* Sidebar based on Mockup */}
      <aside className="w-80 bg-white border-r border-gray-50 flex flex-col p-10 pt-16">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
               {profileRequest.username[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-tight">@{profileRequest.username}</h3>
              <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <ShieldCheck size={10} /> Verified Creator
              </p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-4">
            <SidebarBtn label="OVER VIEW" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsEditing(false); }} />
            <SidebarBtn label="CREATE FRAME" active={false} onClick={() => { setIsEditing(true); setEditCampaignData(null); }} />
            <SidebarBtn label="ALL FRAMES" active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setIsEditing(false); }} />
            <SidebarBtn label="MY FRAMES" active={activeTab === 'my'} onClick={() => { setActiveTab('my'); setIsEditing(false); }} />
        </nav>

        <div className="mt-auto pt-10 border-t border-gray-50">
          <Button onClick={() => { logout(); navigate("/"); }} variant="ghost" className="w-full h-16 rounded-2xl text-red-500 hover:bg-red-50 font-black gap-2 transition-all">
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12 overflow-y-auto">
        {isEditing ? (
            <FrameEditor
                editId={editCampaignData?._id}
                initialData={editCampaignData ? {
                    title: editCampaignData.title,
                    frame_url: editCampaignData.frame_url,
                    placeholders: editCampaignData.placeholders
                } : null}
                onSaveSuccess={() => {
                    setIsEditing(false);
                    setEditCampaignData(null);
                    fetchProfileAndData(user!.id);
                    setActiveTab('my');
                }}
                onCancel={() => {
                    setIsEditing(false);
                    setEditCampaignData(null);
                }}
            />
        ) : (
          <div className="space-y-12">
             <header className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Studio Dashboard</h2>
                <p className="text-gray-400 font-bold">Managed by you.</p>
             </header>

             {activeTab === 'overview' && (
                 <>
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex items-center gap-8 group hover:-translate-y-1 transition-all">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-50">
                                <ImageIcon size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Active Frames</p>
                                <h4 className="text-5xl font-black text-gray-900">{myFramesCount}</h4>
                            </div>
                        </div>
                        <div className="bg-[#5C55F2] p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-black text-2xl mb-2">Design Mastery</h4>
                                <p className="text-white/70 text-xs font-medium max-w-[200px]">Control every pixel of your audience experience.</p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        </div>
                    </div>

                    {/* Create New Card (Mockup Style) */}
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 flex items-center justify-between group overflow-hidden relative">
                        <div>
                            <h3 className="text-3xl font-black text-gray-800">Start New Project</h3>
                            <p className="text-gray-400 font-bold mt-1">Create a fresh card design.</p>
                        </div>
                        <button onClick={() => { setIsEditing(true); setEditCampaignData(null); }} className="bg-indigo-600 hover:bg-indigo-700 h-24 px-12 rounded-[2rem] text-white flex items-center gap-4 transition-all hover:scale-[1.05] shadow-2xl shadow-indigo-200">
                             <Plus size={32} />
                             <span className="text-xl font-black">Create New Card</span>
                        </button>
                    </div>

                    {/* Recently Created (My Frames Preview) */}
                    <div>
                        <h3 className="text-xl font-black text-gray-900 mb-8 px-4 flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                            All My Frames ({userCampaigns.filter(c => c.owner_id === user?.id).length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCampaigns.slice(0, 3).map(c => (
                                <CampaignCard key={c._id} c={c} user={user} onEdit={() => { setEditCampaignData(c); setIsEditing(true); }} />
                            ))}
                        </div>
                        {myCampaigns.length > 3 && (
                            <Button onClick={() => setActiveTab('my')} variant="ghost" className="mt-8 text-indigo-600 font-black">View All My Frames →</Button>
                        )}
                    </div>
                 </>
             )}

             {activeTab === 'all' && (
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">All Platform Frames</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allCampaigns.map(c => (
                            <CampaignCard key={c._id} c={c} user={user} onEdit={() => { setEditCampaignData(c); setIsEditing(true); }} />
                        ))}
                    </div>
                 </div>
             )}

             {activeTab === 'my' && (
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">My Collection ({myCampaigns.length})</h3>
                    {myCampaigns.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                             <ImageIcon size={40} className="mx-auto text-gray-300 mb-4" />
                             <p className="text-gray-400 font-black">No frames created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCampaigns.map(c => (
                                <CampaignCard key={c._id} c={c} user={user} onEdit={() => { setEditCampaignData(c); setIsEditing(true); }} />
                            ))}
                        </div>
                    )}
                 </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

const CampaignCard = ({ c, user, onEdit }: { c: Campaign, user: any, onEdit: (c: Campaign) => void }) => {
    const isOwner = c.owner_id === user?.id;
    return (
        <div className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-xl flex flex-col gap-6 group hover:shadow-2xl transition-all h-full">
            <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 relative">
                <img src={c.frame_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {isOwner && <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg">Your Design</div>}
            </div>
            <div className="flex-1 space-y-4">
                <h4 className="text-xl font-black text-gray-900 truncate pr-2">{c.title}</h4>
                <div className="flex gap-2">
                    <Button onClick={() => window.open(`/participate/${c.slug || c._id}`, '_blank')} className="flex-1 bg-indigo-600 h-12 rounded-2xl text-xs font-black shadow-lg">View Live</Button>
                    {isOwner && (
                        <Button onClick={() => onEdit(c)} variant="outline" className="w-12 h-12 rounded-2xl text-gray-400 border-gray-100 flex items-center justify-center p-0 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
