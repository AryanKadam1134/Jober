
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import EmployerDashboard from "./EmployerDashboard";
import JobSeekerDashboard from "./JobSeekerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardIndex() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return setRole(null);
      // Ideally, fetch role from profiles table
      setRole((data.user.user_metadata.role as string) || null);
    })();
  }, []);
  if (!role) return <div className="pt-20 text-center">Loading dashboard...</div>;
  if (role === "employer") return <EmployerDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <JobSeekerDashboard />;
}
