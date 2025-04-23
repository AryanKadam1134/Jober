import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import JobsPage from "@/pages/jobs";
import DashboardIndex from "@/pages/dashboard";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setLoading(false);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <nav className="px-6 py-3 flex gap-4 border-b shadow items-center bg-white">
            <Link to="/" className="text-xl font-bold text-indigo-700 tracking-wide">Jober</Link>
            <div className="ml-auto flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm rounded px-4 py-2 hover:bg-red-50 font-medium text-red-600"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm rounded px-4 py-2 hover:bg-indigo-100 font-medium text-indigo-700"
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </nav>
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-68px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/dashboard" element={<DashboardIndex />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
