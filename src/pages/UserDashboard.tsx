import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon, Mail, Phone, UserCheck, Clock, ShieldCheck,
  LayoutDashboard, Plus, Image as ImageIcon, LogOut,
  CheckCircle, XCircle, Trash2, Edit3, Palette
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
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);

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
                // ONLY SHOW USER'S OWN FRAMES IN MY STUDIO
                setUserCampaigns(campaigns.filter((c: any) => c.owner_id === userId));
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

  const handleDelete = async (campaignId: string) => {
    if(!confirm("Are you sure you want to delete this frame?")) return;
    try {
        const res = await fetch(`/api/campaigns?id=${campaignId}`, {
            method: 'DELETE',
            headers: {
                'x-requester-id': user!.id,
                'x-requester-role': user!.role || 'user'
            }
        });
        if (res.ok) {
            toast.success("Frame deleted successfully");
            fetchProfileAndData(user!.id);
        }
    } catch (err) {
        toast.error("Failed to delete.");
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

  const myFramesCount = userCampaigns.filter(c => c.owner_id === user?.id).length;

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex">
      <aside className="w-80 bg-white border-r border-gray-50 flex flex-col p-10">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.picture} alt="Profile" className="w-12 h-12 rounded-2xl border-2 border-indigo-100 shadow-sm" />
            <div>
              <h3 className="font-black text-gray-900 leading-tight truncate">@{profileRequest.username}</h3>
              <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <ShieldCheck size={10} /> Verified Creator
              </p>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-4 px-6 py-5 bg-indigo-50 text-indigo-700 rounded-3xl text-sm font-black transition-all">
            <LayoutDashboard size={20} /> My Studio
          </button>
        </nav>
        <div className="mt-auto pt-10 border-t border-gray-50">
          <Button onClick={() => { logout(); navigate("/"); }} variant="ghost" className="w-full h-16 rounded-2xl text-red-500 hover:bg-red-50 font-black gap-2 transition-all">
            <LogOut size={20} /> Logout Studio
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
                }}
                onCancel={() => {
                    setIsEditing(false);
                    setEditCampaignData(null);
                }}
            />
        ) : (
          <div className="space-y-12">
             {/* 1. OVERVIEW STATS */}
             <header className="flex flex-col gap-8">
                <div>
                   <h2 className="text-4xl font-black text-gray-900 tracking-tight">Studio Dashboard</h2>
                   <p className="text-gray-400 font-bold mt-1">Managed by you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                           <ImageIcon size={26} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Active Frames</p>
                        <h4 className="text-4xl font-black text-gray-900">{myFramesCount}</h4>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center">
                        <h4 className="font-black text-xl">Design Mastery</h4>
                        <p className="text-white/70 text-xs font-medium">Control every pixel of your audience experience.</p>
                    </div>
                </div>
             </header>

             {/* 2. ADD FRAME BUTTON */}
             <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
                <div>
                   <h3 className="text-2xl font-black text-gray-900">Start New Project</h3>
                   <p className="text-gray-400 text-sm font-bold">Create a fresh card design.</p>
                </div>
                <Button onClick={() => { setIsEditing(true); setEditCampaignData(null); }} className="bg-indigo-600 hover:bg-indigo-700 h-20 px-12 rounded-3xl text-xl font-black shadow-2xl flex items-center gap-4 transition-all hover:scale-[1.05]">
                    <Plus size={28} /> Create New Card
                </Button>
             </div>

             {/* 3. YOUR PUBLISHED FRAMES */}
             <div>
                <h3 className="text-xl font-black text-gray-900 mb-8 px-2 flex items-center gap-3"><div className="w-2 h-8 bg-indigo-600 rounded-full"></div> All My Frames ({userCampaigns.length})</h3>
                {userCampaigns.length === 0 ? (
                    <div className="bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-[3rem] p-20 text-center">
                        <ImageIcon className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                        <p className="text-indigo-400 font-bold">You haven't created any frames yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userCampaigns.map(c => (
                            <div key={c._id} className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-xl flex flex-col gap-6 group hover:shadow-2xl transition-all">
                                <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 relative">
                                    <img src={c.frame_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase">Your Card</div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <h4 className="text-xl font-black text-gray-900 truncate pr-2">{c.title}</h4>
                                    <div className="flex gap-2">
                                        <Button onClick={() => window.open(`/participate/${c.slug || c._id}`, '_blank')} className="flex-1 bg-indigo-600 h-12 rounded-2xl text-xs font-black shadow-lg">View Live</Button>
                                        <Button onClick={() => { setEditCampaignData(c); setIsEditing(true); }} variant="outline" className="w-12 h-12 rounded-2xl text-gray-400 border-gray-100 flex items-center justify-center p-0 hover:text-indigo-600"><Edit3 size={18} /></Button>
                                        <Button onClick={() => handleDelete(c._id)} variant="outline" className="w-12 h-12 rounded-2xl text-gray-400 border-gray-100 flex items-center justify-center p-0 hover:text-red-600"><Trash2 size={18} /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
