
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import JobCard, { JobItem } from "./JobCard";
import { getJobs } from "@/utils/supabaseJobs";
import { toast } from "sonner";

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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs({ query, category, location, jobType, salary });
      setJobs(data);
    } catch {
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [query, category, location, jobType, salary]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <Input placeholder="Search jobs..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="border rounded px-3 py-2">
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
        <JobCard key={job.id} job={job} onApply={() => { /* open apply modal later */ }} />
      ))}
    </div>
  );
}
