import { Link } from "react-router-dom";
import { Link as LinkIcon, Instagram, Twitter, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-6 group inline-flex">
              <img 
                src="/logo.png" 
                alt="Focal Knot Logo" 
                className="h-10 w-10 object-contain shadow-lg shadow-indigo-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-black text-xl text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                Focal Knot<span className="text-indigo-600 text-3xl leading-[0]">.</span>
              </span>
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
              Crafting premium digital experiences and impactful photo poster campaigns. Turning complex ideas into simple, meaningful focus points.
            </p>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/campaigns" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">Active Campaigns</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">About the Creator</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <LinkIcon size={18} />
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-6 font-bold uppercase tracking-widest">v1.0.0 Alpha</p>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 font-bold text-sm">
            © {new Date().getFullYear()} Focal Knot. Built by Salman Faris. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
