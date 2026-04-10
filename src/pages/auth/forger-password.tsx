import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Aos from 'aos';

import NavbarOne from '../../components/navbar/navbar-one';
import FooterOne from '../../components/footer/footer-one';
import ScrollToTop from '../../components/scroll-to-top';
import bg from '../../assets/img/bg/forget-pass.jpg';

export default function ForgotPassword() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = '#96865d';

  return (
    <>
      <NavbarOne />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)]">
        
        {/* Left Image Column */}
        <div className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-1/2 relative">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src={bg} 
            alt="forgot password" 
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Right Form Column */}
        <div className="w-full md:w-1/2 lg:w-3/5 xl:w-1/2 py-12 px-6 sm:px-10 lg:py-20 lg:px-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Forgot Password?
              </h2>
              <p className="text-base text-gray-500 mt-2">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {success ? (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700" data-aos="fade-up">
                <p className="text-sm font-medium">
                  ✓ Password reset link has been sent to <strong>{email}</strong>.
                </p>
                <p className="text-xs mt-2">Redirecting to login page in a few seconds...</p>
                <Link to="/login" className="text-[#96865d] text-sm font-semibold mt-2 inline-block hover:underline">
                  Click here if not redirected.
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8">
                
                <div data-aos="fade-up" data-aos-delay="200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96865d] focus:border-[#96865d] outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded" data-aos="fade-up">
                    {error}
                  </div>
                )}

                <div className="mt-6" data-aos="fade-up" data-aos-delay="300">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="400">
                  Remember your password?{' '}
                  <Link to="/login" className="text-[#96865d] font-semibold hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}