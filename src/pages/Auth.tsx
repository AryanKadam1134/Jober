
import AuthForm from "@/components/AuthForm";

const AuthPage = () => (
  <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">
      <AuthForm />
    </div>
  </div>
);

export default AuthPage;
