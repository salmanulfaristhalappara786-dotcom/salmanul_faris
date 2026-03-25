import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | Focal Knot — Get in Touch with Salman Faris";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    const subject = encodeURIComponent(`New Inquiry from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    
    // Fallback to mailto client directly
    window.location.href = `mailto:fkdesign786313@gmail.com?subject=${subject}&body=${body}`;
    
    toast.success("Drafting email...");
    setTimeout(() => setIsSending(false), 1500);
  };

  return (
    <section className="py-20 lg:py-32 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-5xl mx-auto shadow-2xl rounded-[3rem] overflow-hidden bg-white flex flex-col md:flex-row border border-gray-100">
          <div className="md:w-2/5 p-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight tracking-tight">Let's build <br />something <span className="text-indigo-200">extraordinary.</span></h2>
              <p className="text-indigo-100 mb-10 font-medium">Have a creative project or just want to say hi? I'm always open to new connections and bold ideas.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.open('mailto:fkdesign786313@gmail.com')}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg shadow-black/5"><Mail className="w-5 h-5 text-indigo-100" /></div>
                  <span className="font-bold tracking-wide">fkdesign786313@gmail.com</span>
                </div>
                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.open('https://wa.me/9074060120')}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg shadow-black/5"><MessageCircle className="w-5 h-5 text-indigo-100" /></div>
                  <span className="font-bold tracking-wide">+91 99469 41098</span>
                </div>
                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.open('https://www.instagram.com/faris_kaithakath')}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg shadow-black/5">
                    <svg className="w-5 h-5 text-indigo-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  <span className="font-bold tracking-wide">@faris_kaithakath</span>
                </div>
              </div>
            </div>
            
            <div className="pt-10 border-t border-white/10 text-indigo-100 text-sm font-medium">
              © 2026 Focal Knot Studio
            </div>
          </div>
          
          <div className="md:w-3/5 p-12 bg-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-sm font-medium" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-sm font-medium" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-sm font-medium resize-none" 
                  required 
                ></textarea>
              </div>
              <Button disabled={isSending} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 py-7 font-bold shadow-xl shadow-indigo-100 gap-2 transition-all hover:scale-[1.02]">
                <Send className="w-5 h-5" /> {isSending ? "Processing..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
