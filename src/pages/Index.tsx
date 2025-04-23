
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold mb-6 text-indigo-800">Find Your Next Career with Jober</h1>
        <p className="text-xl text-gray-700 mb-8">
          Connect with top employers or find qualified candidates. Your next opportunity is just a click away.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-700">Job Seekers</h2>
            <p className="text-gray-600 mb-4">Browse thousands of job listings and apply with a single click.</p>
            <Link 
              to="/auth" 
              className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md shadow hover:bg-indigo-700 font-semibold transition"
            >
              Find a Job
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-700">Employers</h2>
            <p className="text-gray-600 mb-4">Post jobs and find the perfect candidates for your open positions.</p>
            <Link 
              to="/auth" 
              className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md shadow hover:bg-indigo-700 font-semibold transition"
            >
              Post a Job
            </Link>
          </div>
        </div>
        
        <div className="text-gray-600 text-sm">
          Already have an account? <Link to="/auth" className="text-indigo-600 font-medium hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
