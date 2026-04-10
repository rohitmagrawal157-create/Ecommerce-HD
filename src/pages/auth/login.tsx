import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Aos from "aos";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/bg/login.jpg';

// Icons for social login
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function Login() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem("access_token", "demo_token");
      navigate("/my-account");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = "#96865d";

  return (
    <>
      <NavbarOne />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)]">
        
        {/* Left Image Column */}
        <div className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-1/2 relative">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src={bg} 
            alt="login background" 
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Right Form Column */}
        <div className="w-full md:w-1/2 lg:w-3/5 xl:w-1/2 py-12 px-6 sm:px-10 lg:py-20 lg:px-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Welcome back!
              </h2>
              <p className="text-base text-gray-500 mt-2">
                Sign in to your account to continue shopping.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              
              {/* Email Field */}
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

              {/* Password Field */}
              <div className="mt-5" data-aos="fade-up" data-aos-delay="300">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#96865d] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96865d] focus:border-[#96865d] outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="mt-4 flex items-center" data-aos="fade-up" data-aos-delay="400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-2 border-gray-300 rounded checked:bg-[#96865d] checked:border-[#96865d]"
                  />
                  <span className="text-sm text-gray-600 select-none">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded" data-aos="fade-up">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6" data-aos="fade-up" data-aos-delay="500">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

            {/* Social Login */}
            <div className="mt-8" data-aos="fade-up" data-aos-delay="600">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-sm text-gray-500 absolute">
                  Or continue with
                </span>
              </div>

              <div className="mt-5 flex gap-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => console.log("Google login")}
                >
                  <FcGoogle size={20} />
                  <span className="text-sm font-medium">Google</span>
                </button>

                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => console.log("Facebook login")}
                >
                  <FaFacebook size={20} className="text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="700">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#96865d] font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}