
import { supabase } from "@/integrations/supabase/client";

// List jobs with basic search/filter
export async function getJobs(filter: {
  query?: string;
  category?: string;
  location?: string;
  jobType?: string;
  salary?: string;
}) {
  let q = supabase
    .from("jobs")
    .select(
      `id, title, description, location, job_type, salary_min, salary_max, deadline, 
        company:company_id (name), category:category_id (name)`
    )
    .eq("is_active", true);
  if (filter.query) q = q.ilike("title", `%${filter.query}%`);
  if (filter.category) q = q.ilike("category_id", `%${filter.category}%`);
  if (filter.location) q = q.ilike("location", `%${filter.location}%`);
  if (filter.jobType) q = q.eq("job_type", filter.jobType);
  // salary and additional filters can be added here
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Insert or update a job
export async function createOrUpdateJob(payload: any, id?: string) {
  const data = {
    title: payload.title,
    description: payload.description,
    location: payload.location,
    job_type: payload.job_type,
    salary_min: payload.salary_min ? Number(payload.salary_min) : null,
    salary_max: payload.salary_max ? Number(payload.salary_max) : null,
    deadline: payload.deadline,
    company_id: payload.company, // Should actually resolve to company id
    category_id: payload.category, // Should actually resolve to category id
    is_active: true,
  };
  let res;
  if (id) {
    res = await supabase.from("jobs").update(data).eq("id", id);
  } else {
    res = await supabase.from("jobs").insert(data);
  }
  if (res.error) throw res.error;
  return res.data;
}

// File upload + application insert
export async function uploadResumeAndApply({
  job_id,
  resume,
  cover_letter,
  note,
}: {
  job_id: string;
  resume: File;
  cover_letter: string;
  note?: string;
}) {
  // Upload file to Supabase Storage
  const filename = `${Date.now()}-${resume.name}`;
  const { data: upload, error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filename, resume);
  if (uploadError) throw uploadError;
  const publicUrl = supabase.storage.from("resumes").getPublicUrl(filename).data.publicUrl;

  // Insert application row
  const { data, error } = await supabase.from("applications").insert({
    job_id,
    resume_url: publicUrl,
    cover_letter,
    note,
    status: "pending",
    // applicant_id will be filled by auth trigger/RLS
  });
  if (error) throw error;
  return data;
}
