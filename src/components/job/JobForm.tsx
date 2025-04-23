
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrUpdateJob } from "@/utils/supabaseJobs";

type Props = {
  job?: any;
  onSuccess?: () => void;
};

export default function JobForm({ job, onSuccess }: Props) {
  const [form, setForm] = useState({
    title: job?.title || "",
    description: job?.description || "",
    company: job?.company || "",
    location: job?.location || "",
    job_type: job?.job_type || "full_time",
    salary_min: job?.salary_min || "",
    salary_max: job?.salary_max || "",
    category: job?.category || "",
    deadline: job?.deadline || ""
  });
  const [loading, setLoading] = useState(false);

  function handleInput(e: any) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOrUpdateJob(form, job?.id);
      toast.success(job ? "Job updated" : "Job posted");
      onSuccess && onSuccess();
    } catch (err) {
      toast.error("Failed to save job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input name="title" value={form.title} onChange={handleInput} placeholder="Job Title" required />
      <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description" className="w-full border rounded px-3 py-2" required />
      <Input name="company" value={form.company} onChange={handleInput} placeholder="Company Name" required />
      <Input name="location" value={form.location} onChange={handleInput} placeholder="Location" required />
      <select name="job_type" value={form.job_type} onChange={handleInput} className="border rounded px-3 py-2" required>
        <option value="full_time">Full-time</option>
        <option value="part_time">Part-time</option>
        <option value="contract">Contract</option>
        <option value="remote">Remote</option>
      </select>
      <Input type="number" name="salary_min" value={form.salary_min} onChange={handleInput} placeholder="Salary Min" />
      <Input type="number" name="salary_max" value={form.salary_max} onChange={handleInput} placeholder="Salary Max" />
      <Input name="category" value={form.category} onChange={handleInput} placeholder="Category/Industry" />
      <Input type="date" name="deadline" value={form.deadline} onChange={handleInput} required />
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
        {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
      </Button>
    </form>
  );
}
