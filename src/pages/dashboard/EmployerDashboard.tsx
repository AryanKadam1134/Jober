import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import JobForm from "@/components/job/JobForm";
import JobList from "@/components/job/JobList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmployerDashboard() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [jobStats, setJobStats] = useState({
    total: 0,
    active: 0,
    applications: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchJobStats();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserData(user);
    }
  };

  const fetchJobStats = async () => {
    // This would be replaced with actual data fetching from Supabase
    // Placeholder for now
    setJobStats({
      total: 0,
      active: 0,
      applications: 0
    });
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userData?.user_metadata?.full_name || 'Employer'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your job postings and applications
          </p>
        </div>
        <Button 
          onClick={() => setShowJobForm(v => !v)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {showJobForm ? "Hide Form" : "Post New Job"}
        </Button>
      </div>

      {showJobForm && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Job Posting</h2>
          <JobForm onSuccess={() => setShowJobForm(false)} />
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Jobs</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{jobStats.total}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{jobStats.active}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Applications</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{jobStats.applications}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Job Listings</h2>
        <JobList canApply={false} />
      </Card>
    </div>
  );
}
