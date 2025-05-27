import React from 'react';
import { Link } from 'react-router-dom';

const SignInIllustration = ({ className }) => {
  return (
    <img
      src="/loginimg.png" 
      alt="Sign In Illustration"
      className={`w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[340px] mx-auto rounded-lg object-contain ${className || ''}`}
    />
  );
};


function LoginPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    // Proses data login di sini
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center py-6 px-4 sm:px-6 lg:px-8 gap-y-8 md:gap-x-12 lg:gap-x-16">
      
      <div className="flex flex-col items-center md:w-1/2 lg:w-2/5"> {/* Sedikit penyesuaian lebar untuk desktop */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-6 md:mb-0"> {/* mb-6 di mobile, md:mb-0 karena space-y di parent div ilustrasi */}
          <div className="bg-[#2859A6] text-white p-2 sm:p-2.5 rounded-md flex items-center justify-center">
            <span className="font-bold text-lg sm:text-xl leading-none">CV</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2859A6]">CVitae</h1>
        </div>
        {/* Wrapper untuk ilustrasi agar bisa disembunyikan di mobile dan diberi margin atas di desktop */}
        <div className="hidden md:block md:mt-8">
           <SignInIllustration />
        </div>
      </div>

      {/* Kolom Kanan: Form Login */}
      <div className="w-full max-w-sm md:w-1/2 lg:w-3/5 md:max-w-md"> {/* Penyesuaian lebar dan max-w */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign in your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password" // Seharusnya current-password untuk login
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="text-xs sm:text-sm text-gray-600 pt-1 text-left">
            New to CVitae?{' '}
            <Link to="/register" className="font-medium text-[#2859A6] hover:text-[#1e4a8a] hover:underline">
              Create an account
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e4a8a] transition duration-150 ease-in-out"
            >
              Sign In 
              {/* Saya ganti teks tombol menjadi "Sign In" agar sesuai dengan halaman login */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;