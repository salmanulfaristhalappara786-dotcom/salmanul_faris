import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, Sparkles, Image as ImageIcon, UserCircle, Settings2, ShieldCheck } from "lucide-react";

const Home = () => {
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = ["/_NAS8219.JPG", "/DSC01910.JPG"];

  useEffect(() => {
    document.title = "Salmanul Faris — Creative Designer, Developer & Educator";
  }, []);

  // Auto-cycle photos
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoto(prev => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-[#FDFEFF]">
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-bold uppercase tracking-widest mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Creative Designer &amp; Developer
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
              Salmanul Faris <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Designs that Speak.</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              I am Salmanul Faris — crafting high-end poster designs and digital experiences that resonate. Turning complex ideas into simple, meaningful focus points.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link to="/campaigns">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-8 text-xl rounded-2xl shadow-2xl shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-3 group">
                  Active Campaign <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="ghost" className="text-gray-900 border-none hover:bg-transparent px-8 py-8 text-xl font-bold flex items-center gap-2 group underline underline-offset-8 decoration-indigo-200 hover:decoration-indigo-600 transition-all">
                  Meet the Creator
                </Button>
              </Link>
            </div>
            
          </div>
          
          {/* Hero Image Gallery */}
          <div className="lg:w-2/5 relative">
            {/* Main image card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[3rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 transition-transform duration-700 group-hover:-translate-y-3">
                {photos.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Salmanul Faris Portfolio ${i + 1}`}
                    className={`rounded-[2.5rem] w-full h-[560px] object-cover transition-all duration-700 absolute inset-3 ${
                      activePhoto === i ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                    } ${i === 0 ? 'relative' : 'absolute'}`}
                    style={{ position: i === 0 ? 'relative' : 'absolute' }}
                  />
                ))}

                {/* Photo dots indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`rounded-full transition-all duration-300 ${
                        activePhoto === i
                          ? 'w-6 h-2.5 bg-indigo-600'
                          : 'w-2.5 h-2.5 bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-8 -left-8 bg-white px-7 py-6 rounded-3xl shadow-2xl border border-gray-50 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base leading-tight">Next Campaign</h4>
                    <p className="text-gray-400 font-medium text-xs mt-0.5">Launching Soon 2026</p>
                  </div>
                </div>
              </div>

              {/* Top-right badge */}
              <div className="absolute -top-5 -right-5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-xl shadow-indigo-200 z-10">
                ✦ Live Work
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Pages Introduction Section */}
      <section className="py-24 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Explore <span className="text-indigo-600">Salmanul Faris</span></h2>
            <p className="text-lg text-gray-500 font-medium">Discover the different sections of our platform designed to help you engage, create, and manage campaigns effortlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Campaigns Intro */}
            <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-500 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50 mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Active Campaigns</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                View ongoing events, select your favorite campaign frames, and generate customized posters featuring your own photos instantly.
              </p>
              <Link to="/campaigns" className="inline-flex items-center text-indigo-600 font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Explore Campaigns <ChevronRight size={18} />
              </Link>
            </div>

            {/* About Intro */}
            <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-500 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-gray-50 mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <UserCircle size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Meet the Creator</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Get to know Salmanul Faris, the creative mind behind this platform. Learn about his journey in design, development, and education.
              </p>
              <Link to="/about" className="inline-flex items-center text-purple-600 font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Read the Story <ChevronRight size={18} />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
