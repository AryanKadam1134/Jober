export interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  skills: string[];
  experience: {
    title: string;
    company: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website: string | null;
  resume_url: string | null;
}