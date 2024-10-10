import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center w-full">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Let&apos;s Begin</h1>
        <div className="flex justify-between space-x-4">
          <Link 
            href="/case-simulator-selection"
            className="btn-primary flex-1"
          >
            Case Simulator
          </Link>
          <Link
            href="/literature-review-upload"
            className="btn-primary flex-1"
          >
            Review Literature
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
