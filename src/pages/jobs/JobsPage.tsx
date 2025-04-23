
import JobList from "@/components/job/JobList";
export default function JobsPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      <JobList />
    </div>
  );
}
