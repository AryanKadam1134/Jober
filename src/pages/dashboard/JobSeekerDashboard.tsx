import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function JobSeekerDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserData(user);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {userData?.user_metadata?.full_name || 'Job Seeker'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Start your journey to finding your dream job.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/jobs">
              <Button className="w-full mb-3">
                Browse Latest Jobs
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications Submitted</span>
              <span className="font-semibold">{recentApplications.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saved Jobs</span>
              <span className="font-semibold">{savedJobs.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500">No applications yet. Start applying to jobs!</p>
          ) : (
            <div>Applications list will appear here</div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <p className="text-gray-500">No saved jobs yet. Browse jobs and save the ones you like!</p>
          ) : (
            <div>Saved jobs list will appear here</div>
          )}
        </Card>
      </div>
    </div>
  );
}
