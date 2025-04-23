
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

type Role = "job_seeker" | "employer";

const defaultToRole: Record<Role, string> = {
  job_seeker: "Job Seeker",
  employer: "Employer",
};

const AuthForm = () => {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "job_seeker" as Role });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in; if so, redirect
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });
    
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    try {
      z.object({
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        ...(isLogin ? {} : {
          full_name: z.string().min(2, "Name must be at least 2 characters"),
        })
      }).parse(form);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              role: form.role,
            },
          },
        });
        
        if (error) throw error;
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication");
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">{isLogin ? "Sign In" : "Create an Account"}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div>
              <label htmlFor="full_name" className="block mb-1 font-medium text-gray-700">Full Name</label>
              <Input 
                id="full_name" 
                name="full_name" 
                value={form.full_name} 
                onChange={handleInput} 
                placeholder="Enter your full name"
                required 
              />
            </div>
            <div>
              <label htmlFor="role" className="block mb-1 font-medium text-gray-700">I am a</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleInput}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {Object.entries(defaultToRole).map(([v, label]) => (
                  <option value={v} key={v}>{label}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleInput} 
            placeholder="your@email.com"
            required 
            autoComplete="email" 
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Password</label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleInput} 
            placeholder="••••••••"
            required 
            autoComplete={isLogin ? "current-password" : "new-password"} 
          />
        </div>
        {error && <div className="text-red-600 py-2 text-center text-sm">{error}</div>}
        <Button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700" 
          disabled={loading}
        >
          {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Create Account")}
        </Button>
      </form>
      <div className="text-center mt-6">
        <Button 
          variant="ghost" 
          type="button" 
          onClick={() => { setError(null); setIsLogin((v) => !v); }}
          className="text-indigo-600 hover:text-indigo-800"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
