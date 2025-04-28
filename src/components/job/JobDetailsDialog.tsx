import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JobItem } from "./JobCard";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Building2, MapPin, Clock } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-indigo-700">
              {job.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-4 items-center text-gray-600">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {job.company?.name}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {job.job_type}
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
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
        </motion.div>

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