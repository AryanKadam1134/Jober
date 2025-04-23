
import { useState } from "react";
import JobForm from "@/components/job/JobForm";
import JobList from "@/components/job/JobList";

export default function EmployerDashboard() {
  const [showJobForm, setShowJobForm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <button className="text-indigo-600 underline" onClick={() => setShowJobForm((v) => !v)}>
          {showJobForm ? "Hide Form" : "Post a Job"}
        </button>
      </div>
      {showJobForm && <JobForm onSuccess={() => setShowJobForm(false)} />}
      <h2 className="text-xl font-semibold mt-8 mb-4">Your Jobs</h2>
      <JobList canApply={false} />
    </div>
  );
}
