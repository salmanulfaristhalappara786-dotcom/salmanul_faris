import { useEffect, useState } from "react";
import { ChevronRight, Award, BookOpen, Code, Palette } from "lucide-react";

const About = () => {
  const [activePhoto, setActivePhoto] = useState(0);
  const [photos, setPhotos] = useState<string[]>(["/_NAS8219.JPG"]);

  useEffect(() => {
    document.title = "About Salman Faris | Focal Knot — Designer, Developer & Educator";
    
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data && data.about_images && data.about_images.length > 0) {
                setPhotos(data.about_images);
            }
        } catch (err) {
            console.error("About fetch failed", err);
        }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhoto(prev => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [photos]);

  return (
    <section className="py-20 lg:py-32 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="lg:w-1/2 relative group">
            <div className="absolute inset-0 bg-indigo-600 rounded-3xl rotate-3 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-indigo-100"></div>
            
            <div className="relative z-10 aspect-[4/5] lg:aspect-auto lg:h-[600px] overflow-hidden rounded-3xl shadow-2xl">
                {photos.map((src, i) => (
                    <img 
                        key={src}
                        src={src} 
                        alt="Salman Faris" 
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                            activePhoto === i ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                    />
                ))}
            </div>

            {photos.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    {photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActivePhoto(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                activePhoto === i ? 'bg-white w-6' : 'bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            )}
          </div>

          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
              Meet the Creator
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight uppercase">
              Designing the Future, <br />
              <span className="text-indigo-600">One Pixel at a Time.</span>
            </h2>
            <p className="text-gray-500 text-xl mb-8 leading-relaxed font-medium">
              A creative powerhouse merging the worlds of Design, Technology, and Education. Based in Kerala, I help organizations tell their story through impactful posters and modern web apps.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start gap-4 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Palette className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Poster Designer</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Creating visual narratives that capture attention and drive focus since 2018.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start gap-4 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Code className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Web Developer</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Building pixel-perfect, responsive websites with React, Vite, and Tailwind.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start gap-4 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><BookOpen className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Passionate Teacher</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Sharing knowledge and empowering 500+ students in design and tech.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start gap-4 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Award className="w-7 h-7" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Creative Director</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Leading the vision of Focal Knot towards high-end agency excellence.</p>
                </div>
              </div>
            </div>

            <button onClick={() => window.open('https://wa.me/919946941098')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 group uppercase tracking-widest text-xs">
              Work with Me <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
