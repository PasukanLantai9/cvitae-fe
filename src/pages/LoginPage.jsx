import React from 'react';
import { Link } from 'react-router-dom';
const SignInIllustration = () => {
  return (
    <img
      src="./public/registerimg.png"
      alt="Sign Up Illustration"
      className="w-[300px] max-w-md mx-auto lg:max-w-lg rounded-lg object-contain"
    />
  );
};


function LoginPage() {
  const handleSubmit = (event) => {
    event.preventDefault(); 
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

  };

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center py-8 px-4 sm:px-6 lg:px-8 gap-10">
      
      <div className="flex flex-col items-center space-y-6 md:w-1/2">
        <div className="flex items-center space-x-3">
          <div className="bg-[#2859A6] text-white p-2.5 rounded-md flex items-center justify-center">
            <span className="font-bold text-xl sm:text-2xl leading-none">CV</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2859A6]">CVitae</h1>
        </div>
        <SignInIllustration />
      </div>

      <div className="md:w-1/2 w-full max-w-md"> 
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center"> 
          Sign in your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field Nama */}

          {/* Field Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white sm:text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
          {/* Field Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white sm:text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="text-sm text-gray-600 pt-2 text-left"> {/* Memastikan teks rata kiri */}
            New to CVitae{' '}
            <Link to="/register" className="font-medium text-[#2859A6] hover:text-[#2859A6] hover:underline">
              Create an account
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#2859A6] hover:bg-[#2859A6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2859A6] transition duration-150 ease-in-out"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;