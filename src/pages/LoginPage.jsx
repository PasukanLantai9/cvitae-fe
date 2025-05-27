import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignInIllustration = () => {
  return (
    <img
      src="/loginimg.png"
      alt="Sign In Illustration"
      className={`w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[340px] mx-auto rounded-lg object-contain`}
    />
  );
};

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${apiBaseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 200 && responseData.accessToken) {
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('refreshToken', responseData.refreshToken);
        localStorage.setItem('sessionID', responseData.sessionID);
        navigate('/dashboard'); 
      } else if (response.status === 400) {
        setError(responseData.message || 'Invalid email or password.');
      } else if (response.status === 422) {
        setError(responseData.message || 'Please check your input format.');
      } else {
        setError(responseData.message || 'An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center py-6 px-4 sm:px-6 lg:px-8 gap-y-8 md:gap-x-12 lg:gap-x-16">
      <div className="flex flex-col items-center md:w-1/2 lg:w-2/5">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-6 md:mb-0">
          <div className="bg-[#2859A6] text-white p-2 sm:p-2.5 rounded-md flex items-center justify-center">
            <span className="font-bold text-lg sm:text-xl leading-none">CV</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2859A6]">CVitae</h1>
        </div>
        <div className="hidden md:block md:mt-8">
           <SignInIllustration />
        </div>
      </div>
      <div className="w-full max-w-sm md:w-1/2 lg:w-3/5 md:max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign in your account
        </h2>
        {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
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
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white text-sm transition-all disabled:opacity-50"
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
              autoComplete="current-password"
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:border-[#2859A6] focus:bg-white text-sm transition-all disabled:opacity-50"
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
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2859A6] hover:bg-[#1e4a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e4a8a] transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;