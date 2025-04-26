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
    .select(`
      *,
      company:companies(id, name),
      category:categories(name)
    `)
    .eq("is_active", true);

  if (filter.query) q = q.ilike("title", `%${filter.query}%`);
  if (filter.category) q = q.eq("category_id", filter.category);
  if (filter.location) q = q.ilike("location", `%${filter.location}%`);
  if (filter.jobType) q = q.eq("job_type", filter.jobType);

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
    company_id: payload.company_id,
    category_id: payload.category_id,
    is_active: true,
  };

  if (!data.title || !data.description || !data.location || !data.job_type || 
      !data.deadline || !data.company_id || !data.category_id) {
    throw new Error("Missing required fields");
  }

  const { data: result, error } = id 
    ? await supabase.from("jobs").update(data).eq("id", id).select().single()
    : await supabase.from("jobs").insert(data).select().single();

  if (error) throw error;
  return result;
}

// Add this function
export async function applyForJob(jobId: string, application: {
  resume: File;
  cover_letter: string;
  note?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Upload resume
  const fileName = `${user.id}-${Date.now()}-${application.resume.name}`;
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, application.resume);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);

  // Create application
  const { error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      applicant_id: user.id,
      resume_url: publicUrl,
      cover_letter: application.cover_letter,
      note: application.note,
      status: 'pending'
    });

  if (error) throw error;
}
