
import AuthForm from "@/components/AuthForm";

const AuthPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-100">
    <div className="w-full max-w-md rounded-xl bg-white shadow-md p-8">
      <AuthForm />
    </div>
  </div>
);

export default AuthPage;
