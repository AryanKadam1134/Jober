import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplyJobModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyJobModal({ jobId, isOpen, onClose, onSuccess }: ApplyJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cover_letter: "",
    resume: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resume) {
      toast.error("Please upload your resume");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to apply");

      // Upload resume
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${form.resume.name.replace(/\s+/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, form.resume, {
          cacheControl: '3600',
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Create application
      const { error: applyError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: form.cover_letter,
          resume_url: publicUrl,
          status: 'pending'
        });

      if (applyError) throw applyError;

      toast.success("Application submitted successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cover Letter</label>
            <Textarea
              placeholder="Write a brief cover letter..."
              value={form.cover_letter}
              onChange={(e) => setForm(prev => ({ ...prev, cover_letter: e.target.value }))}
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resume (PDF)</label>
            <Input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type !== 'application/pdf') {
                    toast.error("Please upload PDF files only");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("File size should be less than 5MB");
                    return;
                  }
                  setForm(prev => ({ ...prev, resume: file }));
                }
              }}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
