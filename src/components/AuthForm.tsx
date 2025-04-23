
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/");
      }
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">{isLogin ? "Sign In" : "Sign Up"}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div>
              <label htmlFor="full_name" className="block mb-1 font-medium">Full Name</label>
              <Input id="full_name" name="full_name" value={form.full_name} onChange={handleInput} required />
            </div>
            <div>
              <label htmlFor="role" className="block mb-1 font-medium">Account Type</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleInput}
                className="w-full border rounded p-2"
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
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleInput} required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium">Password</label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleInput} required autoComplete={isLogin ? "current-password" : "new-password"} />
        </div>
        {error && <div className="text-red-600 py-2 text-center">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (isLogin ? "Signing in..." : "Signing up...") : (isLogin ? "Sign In" : "Sign Up")}
        </Button>
      </form>
      <div className="text-center mt-4">
        <Button variant="ghost" type="button" onClick={() => { setError(null); setIsLogin((v) => !v); }}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </Button>
      </div>
      <Toaster />
    </div>
  );
};

export default AuthForm;
