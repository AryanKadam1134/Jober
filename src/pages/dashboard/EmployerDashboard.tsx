import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import JobForm from "@/components/job/JobForm";
import JobList from "@/components/job/JobList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner"; // Add this import
import { motion } from "framer-motion";

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export default function EmployerDashboard() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [jobStats, setJobStats] = useState({
    total: 0,
    active: 0,
    applications: 0
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);

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
          jobs!job_id (
            id,
            title,
            location,
            job_type
          ),
          applicant:profiles!applicant_id (
            id,
            full_name,
            title,
            bio,
            skills,
            location,
            experience,
            education,
            linkedin_url,
            github_url,
            website
          )
        `)
        .eq('jobs.company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      
      // Update application stats
      setJobStats(prev => ({
        ...prev,
        applications: data?.length || 0
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchJobStats();
    fetchApplications();

    // Set up real-time subscription for jobs
    const setupJobsSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const subscription = supabase
        .channel('jobs-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'jobs',
            filter: `company_id=eq.${company.id}`
          },
          () => {
            // Refresh job stats when any change occurs
            fetchJobStats();
          }
        )
        .subscribe();

      return subscription;
    };

    let jobsSubscription: any;
    setupJobsSubscription().then(sub => {
      jobsSubscription = sub;
    });

    // Cleanup subscriptions
    return () => {
      if (jobsSubscription) {
        jobsSubscription.unsubscribe();
      }
    };
  }, []);

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success(`Application ${newStatus === 'accepted' ? 'accepted' : 
        newStatus === 'rejected' ? 'rejected' : 'marked as pending'}`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    }
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserData(user);
    }
  };

  const fetchJobStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      // Get total jobs count
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, is_active', { count: 'exact' })
        .eq('company_id', company.id);

      if (jobsError) throw jobsError;

      const total = jobsData?.length || 0;
      const active = jobsData?.filter(job => job.is_active)?.length || 0;

      setJobStats(prev => ({
        ...prev,
        total,
        active
      }));
    } catch (error) {
      console.error("Error fetching job stats:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid gap-6 md:gap-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
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
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Jobs</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{jobStats.total}</p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{jobStats.active}</p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Applications</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{jobStats.applications}</p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {showJobForm && (
                <Card className="mb-8 p-6">
                  <h2 className="text-xl font-semibold mb-4">Create New Job Posting</h2>
                  <JobForm onSuccess={() => setShowJobForm(false)} />
                </Card>
              )}

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Your Job Listings</h2>
                <JobList canApply={false} />
              </Card>

              <Card className="p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Applications</h2>
                <div className="space-y-6">
                  {applications.map((application) => (
                    <div 
                      key={application.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">
                            {application.applicant.full_name}
                          </h3>
                          <p className="text-gray-600">{application.applicant.title}</p>
                          <p className="text-sm text-gray-500">
                            Applied for: {application.jobs.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied on: {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="text-sm border rounded px-2 py-1"
                            value={application.status}
                            onChange={(e) => updateApplicationStatus(application.id, e.target.value as ApplicationStatus)}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplicant(application);
                              setShowApplicantDetails(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <Dialog 
          open={showApplicantDetails} 
          onOpenChange={() => setShowApplicantDetails(false)}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold">{selectedApplicant.applicant.full_name}</h3>
                <p className="text-gray-600">{selectedApplicant.applicant.title}</p>
                <p className="text-gray-500">{selectedApplicant.applicant.location}</p>
              </div>

              {/* Application Details */}
              <div>
                <h4 className="font-medium mb-2">Application Details</h4>
                <p className="text-sm text-gray-600">
                  Applied for: {selectedApplicant.jobs.title}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{selectedApplicant.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Applied on: {new Date(selectedApplicant.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="font-medium mb-2">Cover Letter</h4>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {selectedApplicant.cover_letter}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.applicant.skills?.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-medium mb-2">Experience</h4>
                <div className="space-y-4">
                  {selectedApplicant.applicant.experience?.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium">{exp.title}</h5>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-medium mb-2">Education</h4>
                <div className="space-y-4">
                  {selectedApplicant.applicant.education?.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium">{edu.degree}</h5>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links & Resume */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedApplicant.resume_url, '_blank')}
                >
                  View Resume
                </Button>
                {selectedApplicant.applicant.linkedin_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedApplicant.applicant.linkedin_url, '_blank')}
                  >
                    View LinkedIn Profile
                  </Button>
                )}
                {selectedApplicant.applicant.github_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedApplicant.applicant.github_url, '_blank')}
                  >
                    View GitHub Profile
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
