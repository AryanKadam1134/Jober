import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import JobCard, { JobItem } from "./JobCard";
import { getJobs } from "@/utils/supabaseJobs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import JobForm from "./JobForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import ApplyJobModal from "./ApplyJobModal"; // Add this import

type Props = {
  canApply?: boolean;
};

export default function JobList({ canApply = true }: Props) {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const { role } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const data = await getJobs({ query, category, location, jobType, salary });
      
      if (role === "employer" && user) {
        // Fetch employer's company ID to check ownership
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();
          
        if (company) {
          // Set all jobs but mark which ones are owned by the employer
          setJobs(data.map((job: JobItem) => ({
            ...job,
            isOwner: job.company_id === company.id
          })));
        } else {
          setJobs(data);
        }
      } else {
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [query, category, location, jobType, salary]);

  const handleEdit = (job: JobItem) => {
    setEditingJob(job);
  };

  const handleEditSuccess = () => {
    setEditingJob(null);
    fetchJobs();
    toast.success("Job updated successfully!");
  };

  // Add this function to handle successful application
  const handleApplicationSuccess = async () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    toast.success("Application submitted successfully!");
    // Optionally refresh the jobs list
    await fetchJobs();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <Input placeholder="Search jobs..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <select 
          value={jobType} 
          onChange={(e) => setJobType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {loading && <div className="py-6 flex justify-center">Loading...</div>}
      {!loading && jobs.length === 0 && <div className="text-center py-6">No jobs found.</div>}
      
      {jobs.map(job => (
        <JobCard 
          key={job.id} 
          job={job}
          onApply={canApply ? () => {
            setSelectedJob(job);
            setShowApplyModal(true);
          } : undefined}
          onEdit={job.isOwner ? () => handleEdit(job) : undefined}
          showActions={true}
          isOwner={job.isOwner}
        />
      ))}

      {/* Only render ApplyJobModal if canApply is true */}
      {canApply && selectedJob && (
        <ApplyJobModal
          jobId={selectedJob.id}
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}

      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <div className="sticky top-0 bg-white p-6 border-b z-10">
            <h2 className="text-xl font-semibold">Edit Job Posting</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {editingJob && (
              <JobForm 
                job={editingJob}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
