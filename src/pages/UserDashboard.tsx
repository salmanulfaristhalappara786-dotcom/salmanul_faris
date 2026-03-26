import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon, Mail, Phone, UserCheck, Clock, ShieldCheck,
  LayoutDashboard, Plus, Image as ImageIcon, LogOut,
  CheckCircle, XCircle, Trash2, Edit3, Palette, Layout,
  Share2
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

interface CampaignCardProps {
  c: Campaign;
  user: any;
  isManagement: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const CampaignCard = ({ c, user, isManagement, onEdit, onDelete, onShare }: CampaignCardProps) => {
    return (
        <div className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-xl flex flex-col gap-6 group hover:shadow-2xl transition-all h-full relative">
            <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 relative">
                <img src={c.frame_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-gray-900 truncate pr-2">{c.title}</h4>
                    <Button onClick={(e) => { e.stopPropagation(); onShare(); }} variant="ghost" className="w-10 h-10 rounded-xl text-indigo-500 hover:bg-indigo-50 p-0">
                        <Share2 size={18} />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => window.open(`/participate/${c.slug || c._id}`, '_blank')} className="flex-1 bg-indigo-600 h-12 rounded-2xl text-xs font-black shadow-lg">View Live</Button>
                    {isManagement && (
                        <>
                            <Button onClick={onEdit} variant="outline" className="w-12 h-12 rounded-2xl text-gray-400 border-gray-100 flex items-center justify-center p-0 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></Button>
                            <Button onClick={onDelete} variant="outline" className="w-12 h-12 rounded-2xl text-gray-400 border-gray-100 flex items-center justify-center p-0 hover:text-red-500 transition-colors"><Trash2 size={18} /></Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileRequest, setProfileRequest] = useState<ProfileRequest | null>(null);
  
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
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
            const [cRes, mRes] = await Promise.all([
                fetch('/api/campaigns?status=active'),
                fetch(`/api/campaigns?owner_id=${userId}`)
            ]);
            const campaigns = await cRes.json();
            const userCampaigns = await mRes.json();
            if (Array.isArray(campaigns)) {
                setAllCampaigns(campaigns);
            }
            if (Array.isArray(userCampaigns)) {
                setMyCampaigns(userCampaigns);
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

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: formData.username,
          gmail: user.email,
          phone: formData.phone,
          status: 'pending'
        })
      });
      const data = await res.json();
      if (data && !data.error) {
        toast.success("Request sent! Waiting for admin approval.");
        setProfileRequest(data);
      } else {
        toast.error("Failed to send request.");
      }
    } catch (err) {
      toast.error("Error sending request.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this frame?")) return;
    try {
      const res = await fetch(`/api/campaigns?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-requester-id': user?.id || '' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Frame deleted!");
        setAllCampaigns(prev => prev.filter(c => c._id !== id));
        setMyCampaigns(prev => prev.filter(c => c._id !== id));
      } else throw new Error(data.error);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  const handleShare = (id: string, slug?: string) => {
    const url = `${window.location.origin}/participate/${slug || id}`;
    navigator.clipboard.writeText(url);
    toast.success("Live Link copied!");
  };

  const myFramesCount = myCampaigns.length;

  const SidebarBtn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full h-14 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center border-2 ${active ? 'bg-[#7BB0E8] text-gray-900 border-[#7BB0E8]' : 'bg-white text-gray-400 border-gray-50 hover:border-indigo-200'}`}>
        {label}
    </button>
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // RESTRICED ACCESS VIEW: If not approved
  if (!profileRequest || profileRequest.status !== 'approved') {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-6 mt-16 lg:mt-0">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-50 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
             
             {!profileRequest ? (
               <>
                 <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-xl shadow-indigo-50">
                   <Palette size={40} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Studio Access</h2>
                 <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">
                   Join the Focal Knot creator network. Complete your profile to request access to the Design Studio.
                 </p>
                 
                 <form onSubmit={handleRequestAccess} className="space-y-5 text-left">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Username</label>
                       <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            required 
                            type="text" 
                            placeholder="creative_mind"
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={formData.username}
                            onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp / Phone</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            required 
                            type="tel" 
                            placeholder="+91 0000 000 000"
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-100 mt-4 transition-all hover:scale-[1.02]">
                       Request Access
                    </Button>
                 </form>
               </>
             ) : profileRequest.status === 'pending' ? (
               <>
                 <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-xl shadow-amber-50">
                   <Clock size={40} className="animate-pulse" />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Request Pending</h2>
                 <p className="text-gray-500 font-medium mb-8 leading-relaxed text-sm">
                   Your profile is currently under review by our administrators. You will be notified once access is granted.
                 </p>
                 <div className="p-5 bg-amber-50 rounded-2xl text-amber-700 text-xs font-bold border border-amber-100">
                    Expected Review Time: 24 - 48 Hours
                 </div>
                 <Button onClick={logout} variant="ghost" className="mt-10 text-gray-400 font-black hover:text-red-500">Logout</Button>
               </>
             ) : (
               <>
                 <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-xl shadow-red-50">
                   <XCircle size={40} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Request Rejected</h2>
                 <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">
                   Unfortunately, your access request could not be approved at this time. Please contact support for more details.
                 </p>
                 <Button onClick={logout} className="w-full h-16 bg-gray-900 hover:bg-black rounded-2xl text-white font-black">Back to Home</Button>
               </>
             )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFEFF]">
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-50 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 z-[100] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} pt-16 lg:pt-0 shrink-0`}>
        <div className="p-10 shrink-0 relative">
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"><XCircle size={24} /></button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
               {profileRequest?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-tight truncate max-w-[150px]">@{profileRequest?.username}</h3>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <ShieldCheck size={10} /> Authorized Creator
              </p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-4 px-10 overflow-y-auto flex-1 min-h-0 h-full pb-6">
            <SidebarBtn label="OVER VIEW" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsEditing(false); setSidebarOpen(false); }} />
            <SidebarBtn label="CREATE FRAME" active={false} onClick={() => { setIsEditing(true); setEditCampaignData(null); setSidebarOpen(false); }} />
            <SidebarBtn label="ALL FRAMES" active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setIsEditing(false); setSidebarOpen(false); }} />
            <SidebarBtn label="MY FRAMES" active={activeTab === 'my'} onClick={() => { setActiveTab('my'); setIsEditing(false); setSidebarOpen(false); }} />
        </nav>

        <div className="mt-auto p-10 pt-6 border-t border-gray-50 flex flex-col gap-4 shrink-0">
          <Button onClick={() => navigate("/")} variant="ghost" className="w-full h-14 rounded-xl text-gray-600 font-black gap-2">
             Home Page
          </Button>
          <Button onClick={() => { logout(); navigate("/"); }} variant="ghost" className="w-full h-14 rounded-xl text-red-500 hover:bg-red-50 font-black gap-2 transition-all">
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <main className="flex-1 w-full bg-[#FDFEFF] overflow-y-auto pt-16 lg:pt-0">
        <header className="px-6 md:px-12 py-6 md:py-8 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-10 border-b border-gray-50 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <span className="sr-only">Open Menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Dashboard</h2>
        </header>
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
        {isEditing ? (
            <FrameEditor
                key={editCampaignData?._id || 'new'}
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
          <div className="space-y-12 animate-in fade-in duration-700">
             <header className="hidden lg:flex flex-col gap-2">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Studio <span className="text-indigo-600">Dashboard</span></h2>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Digital Content Management</p>
             </header>

             {activeTab === 'overview' && (
                 <>
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

                    <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 group overflow-hidden relative text-center md:text-left">
                        <div>
                            <h3 className="text-3xl font-black text-gray-800">Start New Project</h3>
                            <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">Create a fresh card design.</p>
                        </div>
                        <button onClick={() => { setIsEditing(true); setEditCampaignData(null); }} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 h-24 px-12 rounded-[2rem] text-white flex justify-center md:justify-start items-center gap-4 transition-all hover:scale-[1.05] shadow-2xl shadow-indigo-200">
                             <Plus size={32} />
                             <span className="text-xl font-black">Create New Card</span>
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-gray-900 mb-8 px-4 flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                            All My Frames ({myFramesCount})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCampaigns.slice(0, 3).map(c => (
                                <CampaignCard key={c._id} c={c} user={user} isManagement={true} onEdit={() => { setEditCampaignData(c); setIsEditing(true); }} onDelete={() => handleDelete(c._id)} onShare={() => handleShare(c._id, c.slug)} />
                            ))}
                        </div>
                        {myCampaigns.length > 3 && (
                            <Button onClick={() => setActiveTab('my')} variant="ghost" className="mt-8 text-indigo-600 font-black w-full md:w-auto">View All My Frames →</Button>
                        )}
                    </div>
                 </>
             )}

             {activeTab === 'all' && (
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">All Platform Frames</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allCampaigns.map(c => (
                            <CampaignCard key={c._id} c={c} user={user} isManagement={false} onEdit={() => {}} onDelete={() => {}} onShare={() => handleShare(c._id, c.slug)} />
                        ))}
                    </div>
                 </div>
             )}

             {activeTab === 'my' && (
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">My Collection ({myCampaigns.length})</h3>
                    {myCampaigns.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 px-6">
                             <ImageIcon size={40} className="mx-auto text-gray-300 mb-4" />
                             <p className="text-gray-400 font-black">No frames created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCampaigns.map(c => (
                                <CampaignCard key={c._id} c={c} user={user} isManagement={true} onEdit={() => { setEditCampaignData(c); setIsEditing(true); }} onDelete={() => handleDelete(c._id)} onShare={() => handleShare(c._id, c.slug)} />
                            ))}
                        </div>
                    )}
                 </div>
             )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
