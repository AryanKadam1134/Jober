import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JobItem } from "./JobCard";
import { formatCurrency } from "@/lib/utils";

interface JobDetailsDialogProps {
  job: JobItem;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onWithdraw?: () => void;
  applicationStatus?: string;
  showApplyButton?: boolean;
  hasApplied?: boolean;
}

export default function JobDetailsDialog({ 
  job, 
  isOpen, 
  onClose,
  onApply,
  onWithdraw,
  applicationStatus,
  showApplyButton = true,
  hasApplied = false
}: JobDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{job.company?.name}</p>
              <p className="text-gray-600">{job.location}</p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              {job.job_type}
            </span>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Salary Range</h3>
            <p className="text-gray-700">
              {job.salary_min && job.salary_max 
                ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                : "Salary not specified"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <p className="text-gray-700">{job.category?.name}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <div className="prose max-w-none text-gray-700">
              {job.description}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Application Deadline</h3>
            <p className="text-gray-700">
              {new Date(job.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {applicationStatus ? (
            <>
              <span className="text-gray-600 self-center">
                Status: {applicationStatus}
              </span>
              {onWithdraw && (
                <Button 
                  variant="destructive" 
                  onClick={onWithdraw}
                >
                  Withdraw Application
                </Button>
              )}
            </>
          ) : hasApplied ? (
            <span className="text-gray-600 self-center">
              You have already applied for this position
            </span>
          ) : (
            showApplyButton && onApply && (
              <Button onClick={onApply}>
                Apply Now
              </Button>
            )
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}