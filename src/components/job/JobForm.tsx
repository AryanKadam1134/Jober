import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateJob } from "@/utils/supabaseJobs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobFormProps {
  onSuccess?: () => void;
  job?: JobItem; // Add this prop
}

export default function JobForm({ onSuccess, job }: JobFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job?.title || "",
    description: job?.description || "",
    location: job?.location || "",
    job_type: job?.job_type || "full_time",
    salary_min: job?.salary_min?.toString() || "",
    salary_max: job?.salary_max?.toString() || "",
    deadline: job?.deadline || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (job) {
        // Update existing job
        await createOrUpdateJob(
          {
            ...formData,
            company_id: job.company_id,
            category_id: job.category_id,
          },
          job.id
        );
      } else {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Not authenticated");

        // Create or get company in a single transaction
        const { data: company, error: companyError } = await supabase.rpc('get_or_create_company', {
          user_id: user.id,
          company_name: `${user.user_metadata.full_name}'s Company`,
          company_description: 'Company description'
        });

        if (companyError) {
          console.error('Company error:', companyError);
          throw new Error('Failed to get or create company');
        }

        // Create job
        const jobData = {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          job_type: formData.job_type,
          salary_min: formData.salary_min ? Number(formData.salary_min) : null,
          salary_max: formData.salary_max ? Number(formData.salary_max) : null,
          deadline: formData.deadline,
          company_id: company.id,
          category_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          is_active: true
        };

        await createOrUpdateJob(jobData);
      }
      
      toast({
        title: "Success",
        description: job ? "Job updated successfully!" : "Job posted successfully!",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Job Title</label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Senior React Developer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Job description and requirements"
          rows={4}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            required
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. New York, NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Type</label>
          <select
            required
            value={formData.job_type}
            onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Minimum Salary</label>
          <Input
            type="number"
            value={formData.salary_min}
            onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
            placeholder="e.g. 50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Maximum Salary</label>
          <Input
            type="number"
            value={formData.salary_max}
            onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
            placeholder="e.g. 80000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Application Deadline</label>
          <Input
            type="date"
            required
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Posting..." : "Post Job"}
      </Button>
    </form>
  );
}