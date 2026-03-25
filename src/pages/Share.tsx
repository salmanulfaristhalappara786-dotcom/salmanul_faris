import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ChevronLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Share = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/submissions?id=${id}`);
        const data = await res.json();
        if (!data || data.error) throw new Error("Not found");
        setSubmission(data);
        document.title = `${data.frame_title} | View Poster — Focal Knot`;
      } catch (error) {
        toast.error("Poster not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const downloadPoster = async () => {
    if (!submission) return;
    const response = await fetch(submission.image_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FocalKnot_Poster_${id}.png`;
    link.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-16">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-gray-500 font-bold">Fetching your masterpiece...</p>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-16 px-4 text-center">
      <h2 className="text-4xl font-black text-gray-900 mb-4">Poster Not Found</h2>
      <Link to="/campaigns"><Button className="bg-indigo-600 rounded-2xl px-8 h-14 font-bold">Explore Campaigns</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold mb-8 transition-colors"><ChevronLeft className="w-5 h-5" /> Back to Campaigns</Link>
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-8 border border-gray-100 p-8 md:p-12 text-center">
          <div className="mb-10"><h2 className="text-3xl font-black text-gray-900 mb-2">{submission.frame_title}</h2><p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Created on {new Date(submission.created_at).toLocaleDateString()}</p></div>
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white mb-12"><img src={submission.image_url} alt="User Poster" className="w-full h-auto" /></div>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Button size="lg" className="h-20 text-xl font-black bg-indigo-600 hover:bg-indigo-700 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3" onClick={downloadPoster}><Download className="w-6 h-6" /> Download HD</Button>
            <Link to={`/participate/${submission.campaign_id}`} className="block w-full"><Button variant="outline" size="lg" className="w-full h-16 rounded-[1.25rem] gap-2 font-bold text-gray-500 border-2 border-gray-100 hover:bg-gray-50"><Plus className="w-5 h-5" /> Create Your Own</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
