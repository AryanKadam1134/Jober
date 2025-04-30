import { useState, useEffect } from "react"; // Add useEffect import
import { Bookmark, BookmarkCheck, Edit, Building2, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ApplyJobModal from "./ApplyJobModal";
import JobDetailsDialog from "./JobDetailsDialog"; // Import JobDetailsDialog
import { motion } from "framer-motion"; // Add this import

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
  isOwner?: boolean;
};

export default function JobCard({ job, onApply, onBookmark, onEdit, showActions = true, isOwner = false }: Props) {
  const { role } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const isEmployer = role === "employer";

  useEffect(() => {
    checkIfSaved();
    checkIfApplied();
  }, [job.id]);

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

  const checkIfApplied = async () => {
    if (isEmployer) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select('id, status')
        .eq('job_id', job.id)
        .eq('applicant_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking application status:", error);
        return;
      }

      if (data) {
        setHasApplied(true);
        setApplicationStatus(data.status);
      } else {
        setHasApplied(false);
        setApplicationStatus(null);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
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

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasApplied) {
      onApply?.(); // Call the onApply callback provided by JobList
    } else {
      toast.error("You have already applied for this position");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 hover-card border-l-4 border-l-indigo-500">
        <CardContent className="p-5">
          <div className="cursor-pointer" onClick={() => setShowJobDetails(true)}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                {job.title}
              </h3>
              <span className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {job.job_type}
              </span>
            </div>
            <div className="text-gray-700 mt-2 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              {job.company?.name}
            </div>
            <div className="text-gray-500 text-sm mt-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {job.location} • 
              <Tag className="w-4 h-4 mx-2" />
              {job.category?.name}
            </div>
            <div className="mt-2 text-sm">{job.description.slice(0, 120)}...</div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-gray-600">
              {job.salary_min !== null && job.salary_max !== null
                ? `$${job.salary_min} - $${job.salary_max}`
                : "Salary not specified"}
            </div>
            {showActions && (
              <div className="flex gap-2">
                {isEmployer ? (
                  isOwner && (
                    <Button size="sm" variant="secondary" onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={handleApplyClick}
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'Applied' : 'Apply'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
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

      {/* Only show JobDetailsDialog if not an employer */}
      {!isEmployer && showJobDetails && (
        <JobDetailsDialog
          job={job}
          isOpen={showJobDetails}
          onClose={() => setShowJobDetails(false)}
          onApply={onApply}
          applicationStatus={applicationStatus}
          hasApplied={hasApplied}
          showApplyButton={!hasApplied}
        />
      )}
    </motion.div>
  );
}
