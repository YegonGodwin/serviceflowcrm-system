import type { FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Visual/Branding */}
        <div className="md:w-1/2 bg-[#222659] p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-[#F26323] rounded-lg flex items-center justify-center font-bold text-xl">S</div>
              <span className="text-2xl font-bold tracking-tight text-white">ServiceFlow <span className="text-[#F26323]">CRM</span></span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Manage your <br />
              <span className="text-[#F26323]">business flow</span> <br />
              with ease.
            </h1>
            <p className="text-slate-300 text-lg max-w-md">
              The all-in-one professional service management platform for modern enterprises.
            </p>
          </div>

          <div className="relative z-10 mt-12 group cursor-default">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full border-2 border-[#222659] bg-slate-400 overflow-hidden transform hover:-translate-y-1 hover:z-20 transition-all cursor-pointer"
                  title={`User ${i}`}
                >
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#222659] bg-[#F26323] flex items-center justify-center text-xs font-bold transform hover:-translate-y-1 hover:z-20 transition-all cursor-pointer">
                +2k
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
              Joined by <span className="text-[#F26323] font-bold">2,000+</span> companies worldwide
            </p>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#F26323] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white text-gray-900">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please enter your details to sign in</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#222659] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-[#F26323] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#222659] focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#222659] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1a1e46] transform transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2026 ServiceFlow CRM</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-600">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
