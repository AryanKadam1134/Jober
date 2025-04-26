import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type JobItem = {
  id: string;
  title: string;
  description: string;
  company: { 
    id: string;
    name: string;
  };
  company_id: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  category: { name: string } | null;
  category_id: string;
  deadline: string;
};

type Props = {
  job: JobItem;
  onApply?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
};

export default function JobCard({ job, onApply, onBookmark, onEdit, showActions = true }: Props) {
  const { role } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isEmployer = role === "employer";

  useEffect(() => {
    checkOwnership();
    checkIfSaved();
  }, [job.id]);

  const checkOwnership = async () => {
    if (!isEmployer) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    setIsOwner(company?.id === job.company_id);
  };

  const checkIfSaved = async () => {
    if (isEmployer) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking saved status:", error);
        return;
      }

      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to save jobs");

      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .match({ 
            job_id: job.id, 
            user_id: user.id 
          });

        if (error) throw error;
        setIsSaved(false);
        toast.success("Job removed from saved jobs");
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({ 
            job_id: job.id, 
            user_id: user.id 
          });

        if (error) throw error;
        setIsSaved(true);
        toast.success("Job saved successfully");
      }

      // Trigger onBookmark callback if provided
      onBookmark?.();
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.message || "Failed to save job");
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{job.title}</h3>
          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">{job.job_type}</span>
        </div>
        <div className="text-gray-700 mt-1">{job.company?.name}</div>
        <div className="text-gray-500 text-sm mt-1">{job.location} • {job.category?.name}</div>
        <div className="mt-2 text-sm">{job.description.slice(0, 120)}...</div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-600">
            {job.salary_min !== null && job.salary_max !== null
              ? `$${job.salary_min} - $${job.salary_max}`
              : "Salary not specified"}
          </div>
          {showActions && (
            <div className="flex gap-2">
              {isEmployer && isOwner ? (
                <Button size="sm" variant="secondary" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : !isEmployer && (
                <>
                  <Button size="sm" variant="secondary" onClick={onApply}>
                    Apply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleSave}
                  >
                    {isSaved ? 
                      <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : 
                      <Bookmark className="w-4 h-4" />
                    }
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
