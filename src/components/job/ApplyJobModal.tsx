
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadResumeAndApply } from "@/utils/supabaseJobs";

type Props = {
  jobId: string;
  onClose: () => void;
};

export default function ApplyJobModal({ jobId, onClose }: Props) {
  const [form, setForm] = useState({ cover_letter: "", note: "", resume: null as File | null });
  const [loading, setLoading] = useState(false);

  const handleInput = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, resume: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.resume) return toast.error("Resume required!");
    setLoading(true);
    try {
      await uploadResumeAndApply({ ...form, job_id: jobId });
      toast.success("Application submitted!");
      onClose();
    } catch {
      toast.error("Failed to apply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-lg p-6 min-w-[340px]">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input type="file" name="resume" onChange={handleFile} accept=".pdf,.doc,.docx" required />
          <textarea name="cover_letter" placeholder="Cover letter" onChange={handleInput} className="w-full border rounded px-3 py-2" required />
          <Input name="note" value={form.note} onChange={handleInput} placeholder="Optional note" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 text-white" disabled={loading}>{loading ? "Applying..." : "Apply"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
