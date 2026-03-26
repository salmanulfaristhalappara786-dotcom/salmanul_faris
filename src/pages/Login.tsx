import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAdminMode = searchParams.get("mode") === "admin";

  useEffect(() => {
    if (isAdminMode) {
      navigate("/admin/login");
      return;
    }
    
    document.title = isAdminMode ? "Admin Login | Salmanul Faris" : "Sign In | Salmanul Faris";
    if (user) {
        if (isAdminMode && user.role !== 'admin') {
            toast.error("You do not have admin access.");
        } else {
            navigate("/dashboard");
        }
    }
  }, [user, navigate, isAdminMode]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const loading = toast.loading("Authenticating...");
      await login(credentialResponse.credential);
      toast.dismiss(loading);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Authentication failed. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Salmanul Faris Logo" 
              className="w-20 h-20 object-contain shadow-2xl shadow-indigo-100/50 rounded-3xl transition-transform hover:scale-110 duration-500" 
            />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isAdminMode ? "Admin Login" : "Sign In"}
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            {isAdminMode ? "Access the dashboard to rule the site." : "Welcome back to Salmanul Faris."}
          </p>
          
          <div className="py-6 flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
              <p className="text-xs text-gray-400 font-medium">Fast & Secure Access</p>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center gap-6">
            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors underline underline-offset-4">Back to Home</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
