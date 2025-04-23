import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import JobCard, { JobItem } from "./JobCard";
import { getJobs } from "@/utils/supabaseJobs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import JobForm from "./JobForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const data = await getJobs({ query, category, location, jobType, salary });
      
      if (role === "employer" && user) {
        // Fetch employer's company ID
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();
          
        if (company) {
          // Filter jobs to show only those owned by the employer
          setJobs(data.filter((job: JobItem) => job.company_id === company.id));
        } else {
          setJobs([]);
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
          onApply={() => {/* open apply modal later */}}
          onEdit={() => handleEdit(job)}
          showActions={true}
        />
      ))}

      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <h2 className="text-xl font-semibold mb-4">Edit Job Posting</h2>
          {editingJob && (
            <JobForm 
              job={editingJob}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
