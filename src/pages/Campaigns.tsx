import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, Image as ImageIcon, Sparkles, LayoutDashboard, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/campaigns?status=active');
        const data = await res.json();
        if (Array.isArray(data)) setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    document.title = "Active Campaigns | Focal Knot";
  }, []);

  const handleShare = (e: React.MouseEvent, id: string, slug?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/participate/${slug || id}`;
    navigator.clipboard.writeText(url);
    toast.success("Campaign link copied!");
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF]">
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-6">
              Active <span className="text-indigo-600">Campaigns.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Join our active initiatives and share your voice using our premium frame studio.
            </p>
          </div>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 font-black text-lg gap-3 transition-transform hover:scale-105 active:scale-95">
              <LayoutDashboard size={20} /> Access Your Studio
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 h-[500px] rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {campaigns.map((campaign) => (
              <Link 
                key={campaign._id} 
                to={`/participate/${campaign._id}`}
                className="group relative bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-[transform,box-shadow] duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative">
                  <img 
                    src={campaign.frame_url} 
                    alt={campaign.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                      <ChevronRight size={32} />
                    </div>
                  </div>
                  
                  {/* Share Button Overlay */}
                  <button 
                    onClick={(e) => handleShare(e, campaign._id, campaign.slug)}
                    className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl hover:bg-white hover:scale-110 transition-all z-20"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
                
                <div className="p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest rounded-full uppercase">Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{campaign.title}</h3>
                  <p className="text-gray-500 font-medium mb-8 line-clamp-2">{campaign.description || "Join this campaign and express yourself with our custom designed frames."}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       Join Movement <ArrowRight size={14} className="text-indigo-600" />
                    </span>
                    <div className="flex items-center gap-4">
                        <Sparkles size={20} className="text-indigo-100 group-hover:text-indigo-300 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[4rem] border border-gray-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-8 shadow-sm">
              <ImageIcon size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">No Active Campaigns</h3>
            <p className="text-gray-500 font-medium">Please check back later for new initiatives!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
