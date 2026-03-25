import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/campaigns", label: "Active Campaign" },
    { to: "/contact", label: "Contact Us" },
    user ? { to: "/dashboard", label: "Studio" } : { to: "/login", label: "Login" },
  ].filter(Boolean);

  // Hide navbar on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <img 
              src="/logo.png" 
              alt="Focal Knot Logo" 
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" 
            />
            <span className="text-xl font-black text-gray-900 tracking-tighter hidden sm:inline">
              FOCAL KNOT<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link: any) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === link.to
                    ? "text-indigo-700 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-100">
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link: any) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-indigo-700 bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
                 <button 
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    Logout
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
