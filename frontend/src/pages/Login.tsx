"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Boxes } from "@/components/ui/background-boxes";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { handleLogin, error, setError, isLoading } = useAuthForm();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const userData = await handleLogin(formData);
      toast({
        title: "Login successful",
        description: `Welcome back${userData?.firstName ? ', ' + userData.firstName : ''}!`,
      });
      
      // Redirect based on user role
      if (userData?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Error is already handled by useAuthForm
      toast({
        title: "Login failed",
        description: error || "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Boxes */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />

      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-8 left-8 z-10 flex items-center gap-2 text-white hover:text-gold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Login Form */}
      <div className="relative bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Tabs */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Sign in to your account
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-gold focus:ring-gold/20 pl-10"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-gold focus:ring-gold/20 pr-10"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/90 text-gray-400">OR SIGN IN WITH</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Google */}
            <Button
              variant="outline"
              className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50 py-3"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-sm flex items-center justify-center text-xs font-bold text-white">
                  G
                </div>
                <span className="text-sm">Google</span>
              </div>
            </Button>

            {/* Apple */}
            <Button
              variant="outline"
              className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50 py-3"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm">Apple</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-gray-400 text-center">
          By signing in, you agree to our{" "}
          <a href="#" className="text-gold hover:underline">
            Terms & Service
          </a>
        </p>
      </div>
    </div>
  );
}
