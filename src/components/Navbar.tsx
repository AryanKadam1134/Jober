import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { role, loading, checkUser, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <nav className="px-6 py-3 flex gap-4 border-b shadow items-center bg-white">
      <Link to="/" className="text-xl font-bold text-indigo-700 tracking-wide">
        Jober
      </Link>
    </nav>;
  }

  return (
    <nav className="px-6 py-3 flex gap-4 border-b shadow items-center bg-white">
      <Link to="/" className="text-xl font-bold text-indigo-700 tracking-wide">
        Jober
      </Link>

      {/* Navigation Links - Only show for authenticated users */}
      {role && (
        <div className="ml-8 space-x-4">
          <Link
            to="/jobs"
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            Browse Jobs
          </Link>
          
          {role === "employer" && (
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              Post a Job
            </Link>
          )}
        </div>
      )}

      {/* Auth Buttons */}
      <div className="ml-auto flex items-center gap-4">
        {role ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
              Login / Sign Up
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}