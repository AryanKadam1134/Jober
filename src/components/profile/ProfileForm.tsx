import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { Card } from "@/components/ui/card";

interface ProfileFormProps {
  initialData?: Partial<ProfileData>;
  onSuccess?: () => void;
}

export default function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    bio: initialData?.bio || "",
    skills: initialData?.skills || [],
    location: initialData?.location || "",
    linkedin_url: initialData?.linkedin_url || "",
    github_url: initialData?.github_url || "",
    website: initialData?.website || "",
  });

  const [experiences, setExperiences] = useState(initialData?.experience || []);
  const [education, setEducation] = useState(initialData?.education || []);
  const [resume, setResume] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let resume_url = initialData?.resume_url;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Handle resume upload
      if (resume) {
        try {
          // Delete old resume if exists
          if (initialData?.resume_url) {
            const oldFileName = initialData.resume_url.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('resumes')
                .remove([oldFileName]);
            }
          }

          // Create a clean filename
          const timestamp = Date.now();
          const cleanFileName = resume.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${user.id}/${timestamp}-${cleanFileName}`;

          // Upload new resume
          const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, resume, {
              cacheControl: '3600',
              contentType: 'application/pdf',
              upsert: true
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }

          // Get public URL with signed URLs
          const { data } = await supabase.storage
            .from('resumes')
            .createSignedUrl(fileName, 31536000); // URL valid for 1 year

          if (data) {
            resume_url = data.signedUrl;
            console.log("Resume uploaded successfully:", resume_url);
          } else {
            throw new Error("Failed to generate signed URL");
          }
        } catch (error) {
          console.error("Resume upload error:", error);
          throw new Error("Failed to upload resume");
        }
      }

      // Update profile with new resume URL
      const updatedProfile = {
        id: user.id,
        full_name: user.user_metadata.full_name,
        title: formData.title || null,
        bio: formData.bio || null,
        skills: formData.skills,
        location: formData.location || null,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        website: formData.website || null,
        experience: experiences,
        education: education,
        resume_url,
        role: 'job_seeker',
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updatedProfile)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success("Profile updated successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {/* Basic Information */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Professional Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <Input
                  value={formData.skills.join(", ")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="e.g. React, TypeScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Experience Section */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Experience</h3>
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="grid gap-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[index].title = e.target.value;
                        setExperiences(newExp);
                      }}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[index].company = e.target.value;
                        setExperiences(newExp);
                      }}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[index].start_date = e.target.value;
                        setExperiences(newExp);
                      }}
                    />
                    <Input
                      type="date"
                      value={exp.end_date || ""}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[index].end_date = e.target.value;
                        setExperiences(newExp);
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setExperiences(experiences.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setExperiences([...experiences, {
                title: "",
                company: "",
                start_date: "",
                end_date: null,
                description: ""
              }])}
            >
              Add Experience
            </Button>
          </div>
        </Card>

        {/* Similar compact layout for Education and Links sections */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <Input
                className="mb-2"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].degree = e.target.value;
                  setEducation(newEdu);
                }}
              />
              <Input
                className="mb-2"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].institution = e.target.value;
                  setEducation(newEdu);
                }}
              />
              <Input
                className="mb-2"
                placeholder="Year"
                value={edu.year}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].year = e.target.value;
                  setEducation(newEdu);
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setEducation(education.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setEducation([...education, {
              degree: "",
              institution: "",
              year: ""
            }])}
          >
            Add Education
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Links & Resume</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <Input
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Personal Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resume (PDF only)</label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        toast.error("Please upload PDF files only");
                        e.target.value = '';
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        toast.error("File size should be less than 5MB");
                        e.target.value = '';
                        return;
                      }
                      setResume(file);
                      toast.success("Resume selected successfully");
                    }
                  }}
                />
                {initialData?.resume_url && (
                  <div className="flex items-center gap-2">
                    <a 
                      href={initialData.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View current resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="sticky bottom-0 bg-white py-4 border-t mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}