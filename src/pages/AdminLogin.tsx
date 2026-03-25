import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded check as requested by user
    if (username === "fkdesign" && password === "admin123") {
      // Create a mock admin user object
      const adminUser = {
        id: "admin-fk",
        name: "Admin",
        email: "admin@salmanulfaris.com",
        role: "admin",
        picture: "/logo.png"
      };
      
      adminLogin(adminUser, "admin-token-fkdesign");

      toast.success("Admin access granted");
      navigate("/admin");
    } else {
      toast.error("Invalid admin credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 font-medium mt-2">Sign in to manage campaigns</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-8 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100 transition-all"
          >
            {loading ? "Verifying..." : "Sign In to Dashboard"}
          </Button>
        </form>
        
        <p className="text-center text-gray-400 text-xs mt-8 font-bold uppercase tracking-widest">
          Secure Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
