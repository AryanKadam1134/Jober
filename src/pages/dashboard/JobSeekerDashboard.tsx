import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileData } from "@/types/profile";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileCard from "@/components/profile/ProfileCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import JobDetailsDialog from "@/components/job/JobDetailsDialog";
import { JobItem } from "@/components/job/JobCard";
import ApplyJobModal from "@/components/job/ApplyJobModal";
import { BookmarkCheck } from "lucide-react";

export default function JobSeekerDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<Partial<ProfileData> | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobItem | null>(null);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUserData(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      console.log("Fetched profile data:", data);
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setShowProfileForm(false); // First close the form
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await fetchProfileData(); // Then refresh the data
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Failed to refresh profile display");
      // Fetch data again if there was an error
      fetchProfileData();
    }
  };

  // Add this function to handle withdrawal
  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      toast.success("Application withdrawn successfully");
      await fetchApplications(); // Refresh the applications list
      setShowJobDetails(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  // Add this function after handleWithdrawApplication
  const handleUnsaveJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId);

      if (error) throw error;

      toast.success("Job removed from saved jobs");
      await fetchSavedJobs(); // Refresh the saved jobs list
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Failed to remove job from saved list");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchProfileData();
    fetchApplications();
    fetchSavedJobs();

    // Set up real-time subscription for application status updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('jobseeker-application-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications',
            filter: `applicant_id=eq.${user.id}`
          },
          (payload) => {
            // Update the application in the local state
            setRecentApplications(prev => 
              prev.map(app => {
                if (app.id === payload.new.id) {
                  return {
                    ...app,
                    status: payload.new.status,
                    updated_at: payload.new.updated_at
                  };
                }
                return app;
              })
            );

            // Show appropriate notification based on status
            const status = payload.new.status;
            const messages = {
              accepted: '🎉 Congratulations! Your application has been accepted!',
              rejected: '😔 Your application has been rejected.',
              pending: '📝 Your application status has been updated to pending.'
            };
            toast.info(messages[status as keyof typeof messages]);
          }
        )
        .subscribe();

      return subscription;
    };

    let subscription: any;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          created_at,
          updated_at,
          status,
          jobs!job_id (
            id,
            title,
            description,
            location,
            job_type,
            salary_min,
            salary_max,
            deadline,
            category:categories(name),
            company:companies!fk_company (
              id,
              name
            )
          )
        `)
        .eq('applicant_id', user.id)
        .order('updated_at', { ascending: false }); // Sort by last updated

      if (error) throw error;
      setRecentApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          created_at,
          jobs!job_id (
            id,
            title,
            description,
            location,
            job_type,
            salary_min,
            salary_max,
            deadline,
            category:categories(name),
            company:companies!fk_company (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  // Add this function to handle successful application
  const handleApplicationSuccess = async () => {
    setShowApplyModal(false);
    setSelectedJobToApply(null);
    await fetchApplications();
    toast.success("Application submitted successfully!");
  };

  // Add this function to check application status
  const checkIfJobApplied = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('applications')
        .select('id, status')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error checking application status:", error);
      return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {userData?.user_metadata?.full_name || 'Job Seeker'}!
            </h1>
            <p className="text-gray-600 mt-2">
              {profileData?.title || 'Complete your profile to start your journey'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Profile and Stats */}
        <div className="md:col-span-2">
          {isLoading ? (
            <Card className="mb-6 p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </Card>
          ) : profileData ? (
            <ProfileCard 
              profile={profileData} 
              onEdit={() => setShowProfileForm(true)}
            />
          ) : (
            <Card className="mb-6 p-6">
              <p className="text-center text-gray-500">
                Complete your profile to increase your chances of getting hired
              </p>
              <Button 
                onClick={() => setShowProfileForm(true)}
                className="mt-4 w-full"
              >
                Create Profile
              </Button>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
              {recentApplications.length === 0 ? (
                <p className="text-gray-500">No applications yet. Start applying to jobs!</p>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div 
                      key={application.id} 
                      className="border-b pb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      onClick={() => {
                        setSelectedJob({
                          ...application.jobs,
                          applicationId: application.id,
                          applicationStatus: application.status
                        });
                        setShowJobDetails(true);
                      }}
                    >
                      <h3 className="font-medium">{application.jobs.title}</h3>
                      <p className="text-sm text-gray-600">{application.jobs.company.name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Applied on: {new Date(application.created_at).toLocaleDateString()}
                          {application.updated_at && application.updated_at !== application.created_at && (
                            <span className="ml-2">
                              • Updated: {new Date(application.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Saved Jobs</h2>
              {savedJobs.length === 0 ? (
                <p className="text-gray-500">No saved jobs yet. Browse jobs and save the ones you like!</p>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((saved) => (
                    <div 
                      key={saved.id} 
                      className="border-b pb-4"
                    >
                      <div 
                        className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                        onClick={async () => {
                          const applicationData = await checkIfJobApplied(saved.jobs.id);
                          setSelectedJob({
                            ...saved.jobs,
                            applicationId: applicationData?.id,
                            applicationStatus: applicationData?.status
                          });
                          setShowJobDetails(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{saved.jobs.title}</h3>
                            <p className="text-sm text-gray-600">{saved.jobs.company.name}</p>
                            <p className="text-xs text-gray-500">
                              Saved on: {new Date(saved.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsaveJob(saved.id);
                              }}
                            >
                              <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/jobs">
                <Button className="w-full mb-3">
                  Browse Latest Jobs
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowProfileForm(true)}
              >
                Update Profile
              </Button>
            </div>
          </Card>

          <Card className="p-6 mt-6">
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
      </div>

      <Dialog 
  open={showProfileForm} 
  onOpenChange={(open) => {
    if (!open) {
      fetchProfileData(); // Refresh data when dialog is closed
    }
    setShowProfileForm(open);
  }}
>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {profileData ? 'Update Profile' : 'Create Profile'}
      </DialogTitle>
      <DialogDescription>
        Fill in your professional details to help employers understand your qualifications better.
      </DialogDescription>
    </DialogHeader>
    
    <div className="overflow-y-auto py-4">
      <ProfileForm 
        key={Date.now()} // Force re-render on each open
        initialData={profileData || undefined}
        onSuccess={handleProfileUpdate}
      />
    </div>
  </DialogContent>
</Dialog>

      {selectedJobToApply && (
        <ApplyJobModal
          jobId={selectedJobToApply.id}
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJobToApply(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Update the JobDetailsDialog usage */}
      {selectedJob && (
        <JobDetailsDialog
          job={selectedJob}
          isOpen={showJobDetails}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          onApply={() => {
            if (!selectedJob.applicationId) {
              setShowJobDetails(false);
              setSelectedJobToApply(selectedJob);
              setShowApplyModal(true);
            }
          }}
          onWithdraw={
            selectedJob.applicationId 
              ? () => handleWithdrawApplication(selectedJob.applicationId!)
              : undefined
          }
          applicationStatus={selectedJob.applicationStatus}
          showApplyButton={!selectedJob.applicationId}
        />
      )}
    </div>
  );
}
