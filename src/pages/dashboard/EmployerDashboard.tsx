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
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          created_at,
          status,
          resume_url,
          cover_letter,
          job:jobs(id, title),
          applicant:profiles(id, full_name, title)
        `)
        .eq('jobs.company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchJobStats();
    fetchApplications();
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

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{application.applicant.full_name}</h3>
                  <p className="text-sm text-gray-600">{application.applicant.title}</p>
                  <p className="text-sm text-gray-500">Applied for: {application.job.title}</p>
                </div>
                <Button
                  variant="link"
                  onClick={() => window.open(application.resume_url, '_blank')}
                >
                  View Resume
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
