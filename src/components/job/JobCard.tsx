
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type JobItem = {
  id: string;
  title: string;
  description: string;
  company: { name: string };
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  category: { name: string } | null;
  deadline: string;
};

type Props = {
  job: JobItem;
  onApply?: () => void;
  onBookmark?: () => void;
};

export default function JobCard({ job, onApply, onBookmark }: Props) {
  return (
    <Card className="mb-4 shadow-md">
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
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={onApply}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={onBookmark}>
              <Bookmark />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
