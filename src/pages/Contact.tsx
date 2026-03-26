import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const mapUrl = "https://www.google.com/maps/place/FK+DESIGN+POINT/@11.0732984,75.8927349,16z/data=!4m10!1m2!2m1!1sfk+design!3m6!1s0x3ba64d378a8c604b:0x828691f123e6ab9c!8m2!3d11.0725929!4d75.9001777!15sCglmayBkZXNpZ25aCyIJZmsgZGVzaWdukgEPZGVzaWduX2VuZ2luZWVy4AEA!16s%2Fg%2F11q44g4d3s?entry=ttu&g_ep=EgoyMDI2MDMyMy4xIKXMDSoASAFQAw%3D%3D";

  useEffect(() => {
    document.title = "Contact Us | Focal Knot — Get in Touch with Salman Faris";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    const subject = encodeURIComponent(`New Inquiry from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    
    window.location.href = `mailto:fkdesign786313@gmail.com?subject=${subject}&body=${body}`;
    
    toast.success("Drafting email...");
    setTimeout(() => setIsSending(false), 1500);
  };

  return (
    <section className="py-20 lg:py-32 bg-[#FDFEFF] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="shadow-2xl rounded-[3.5rem] overflow-hidden bg-white flex flex-col lg:flex-row border border-gray-50">
            <div className="lg:w-2/5 p-12 bg-gradient-to-br from-[#5C55F2] to-[#4b43d6] text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight tracking-tight">Let's build <br />something <span className="text-indigo-200">great.</span></h2>
                <p className="text-indigo-100/80 mb-12 font-bold leading-relaxed">Have a creative project or just want to say hi? I'm always open to new connections and bold ideas.</p>
                
                <div className="space-y-8">
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.open('mailto:fkdesign786313@gmail.com')}>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-xl"><Mail className="w-6 h-6 text-white" /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Email Us</span>
                        <span className="font-black text-sm tracking-wide">fkdesign786313@gmail.com</span>
                    </div>
                    </div>
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.open('https://wa.me/919946941098')}>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-xl"><MessageCircle className="w-6 h-6 text-white" /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">WhatsApp</span>
                        <span className="font-black text-sm tracking-wide">+91 99469 41098</span>
                    </div>
                    </div>
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.open(mapUrl)}>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-xl"><MapPin className="w-6 h-6 text-white" /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Visit Studio</span>
                        <span className="font-black text-sm tracking-wide">FK DESIGN POINT, Kerala</span>
                    </div>
                    </div>
                </div>
                </div>
                
                <div className="pt-10 border-t border-white/10 text-indigo-200/50 text-[10px] font-black uppercase tracking-widest relative z-10">
                © 2026 Focal Knot Studio
                </div>
            </div>
            
            <div className="lg:w-3/5 p-12 bg-white">
                <header className="mb-10">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Drop a message</h3>
                    <p className="text-gray-400 font-bold">I'll get back to you within 24 hours.</p>
                </header>
                <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-black outline-none" 
                        placeholder="John Doe"
                        required 
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-black outline-none" 
                        placeholder="john@example.com"
                        required 
                    />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-black outline-none resize-none" 
                    placeholder="Tell me about your project..."
                    required 
                    ></textarea>
                </div>
                <Button disabled={isSending} className="bg-[#5C55F2] hover:bg-[#4b43d6] text-white h-16 rounded-[1.5rem] px-12 font-black shadow-2xl shadow-indigo-100 gap-3 transition-all hover:scale-[1.05] active:scale-95 group">
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {isSending ? "SUBMITTING..." : "SEND MESSAGE"}
                </Button>
                </form>
            </div>
            </div>

            {/* Map Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-6 font-black text-gray-800 text-xl tracking-tight uppercase">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                    Find Us on Maps
                </div>
                <div className="h-[450px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white shadow-indigo-100/50 relative group">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.4172778601675!2d75.897989!3d11.0725929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64d378a8c604b%3A0x828691f123e6ab9c!2sFK%20DESIGN%20POINT!5e0!3m2!1sen!2sin!4v1711446700000!5m2!1sen!2sin" 
                        className="absolute inset-0 w-full h-full border-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white flex flex-col md:flex-row items-center justify-between gap-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div>
                            <h4 className="font-black text-gray-900 text-xl">FK DESIGN POINT</h4>
                            <p className="text-gray-500 font-bold text-sm">Creative Design & Print Solutions</p>
                        </div>
                        <Button onClick={() => window.open(mapUrl)} className="bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl px-8 font-black shadow-xl shadow-indigo-100 gap-2">
                             <MapPin size={20} /> Open in Google Maps
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
