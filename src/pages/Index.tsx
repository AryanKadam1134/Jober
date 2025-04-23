// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <nav className="flex justify-end mb-8">
          <a 
            href="/auth" 
            className="text-indigo-600 hover:underline ml-auto px-4 py-2 bg-white shadow rounded"
          >Login / Signup</a>
        </nav>
        <h1 className="text-4xl font-bold mb-4">Welcome to Jober</h1>
        <p className="text-xl text-gray-600 mb-4">Find your next opportunity or post new jobs in seconds.</p>
        <div className="flex flex-col gap-4 mt-6">
          <a href="/auth" className="bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 font-semibold transition">Get Started</a>
        </div>
      </div>
    </div>
  );
};

export default Index;
