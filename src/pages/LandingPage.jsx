import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="bg-white text-[#333333] min-h-screen flex flex-col justify-between font-sans">

      <header className="container mx-auto pt-6 pb-4 md:pt-10 md:pb-6 flex justify-center">
        <div className="inline-flex flex-col items-center bg-[#2859A6] text-white p-2.5 md:p-3 rounded-lg shadow-md">
          <span className="font-bold text-2xl md:text-3xl tracking-tight leading-none">CV</span>
          <div className="mt-1 md:mt-1.5 space-y-0.5 md:space-y-1">
            <div className="w-8 md:w-10 h-[2.5px] md:h-[3px] bg-white rounded-sm"></div>
            <div className="w-8 md:w-10 h-[2.5px] md:h-[3px] bg-white rounded-sm"></div>
            <div className="w-8 md:w-10 h-[2.5px] md:h-[3px] bg-white rounded-sm"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6 flex-grow flex flex-col justify-center items-center">
        <div className="w-full">
          <div className="w-full text-center mb-6 md:mb-8 lg:mb-10">
            <h1 className="text-3xl leading-snug sm:text-4xl sm:leading-tight md:text-[55.83px] md:leading-tight font-bold text-[#333333] mb-3 md:mb-4">
              Professional CV? One<br />Minute is All You Need!
            </h1>
            <p
              className="text-sm leading-relaxed sm:text-base md:text-[22.73px] md:leading-[1.5] text-[#555555] max-w-[280px] sm:max-w-[360px] md:max-w-[480px] mx-auto"
            >
              Craft standout CVs effortlessly and in<br />minutes with <span className="font-semibold text-[#2859A6]">CVitae</span>.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-center w-full md:space-x-6 lg:space-x-10 xl:space-x-12 max-w-4xl lg:max-w-5xl mx-auto">
            <div className="w-full md:w-[45%] flex justify-center md:justify-end mb-6 md:mb-0">
              <img
                src="/landingpageimg.png"
                alt="CV Creation Interface Illustration"
                className="max-w-[200px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[400px] xl:max-w-[460px] rounded-lg object-contain"
              />
            </div>

            <div className="w-full md:w-[55%] flex flex-col items-center md:items-start text-center md:text-left">
              <Link to="/register" className="mb-4 block w-full sm:w-auto">
                <button
                  className="bg-[#2859A6] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-10 rounded-lg shadow-lg hover:bg-[#1f4a8e] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2859A6] focus:ring-opacity-50 w-full sm:w-auto"
                >
                  Craft Your Future Now
                </button>
              </Link>

              <p className="text-[#666666] text-xs sm:text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#2859A6] font-semibold hover:underline">
                  sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 md:py-6 text-center mt-8 md:mt-10">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center items-center gap-x-4 md:gap-x-6 mb-2 text-gray-600 text-xs sm:text-sm">
            <Link to="/about" className="hover:text-[#2859A6] hover:underline">About</Link>
            <Link to="/faq" className="hover:text-[#2859A6] hover:underline">FAQ</Link>
            <Link to="/about-2" className="hover:text-[#2859A6] hover:underline">About</Link>
          </nav>
          <p className="text-[10px] sm:text-xs text-gray-500">© 2025 CVitae</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;