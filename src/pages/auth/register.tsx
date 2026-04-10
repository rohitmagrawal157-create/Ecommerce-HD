import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Aos from "aos";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/bg/register.jpg';

// Social icons
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function Register() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
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
            alt="register background" 
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Right Form Column */}
        <div className="w-full md:w-1/2 lg:w-3/5 xl:w-1/2 py-12 px-6 sm:px-10 lg:py-20 lg:px-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Create New Account
              </h2>
              <p className="text-base text-gray-500 mt-2">
                Join us to start shopping and get exclusive offers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              
              {/* Full Name */}
              <div data-aos="fade-up" data-aos-delay="200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96865d] focus:border-[#96865d] outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div className="mt-5" data-aos="fade-up" data-aos-delay="300">
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

              {/* Password */}
              <div className="mt-5" data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96865d] focus:border-[#96865d] outline-none transition"
                  placeholder="Min. 6 characters"
                />
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="mt-4 flex items-start" data-aos="fade-up" data-aos-delay="500">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded checked:bg-[#96865d] checked:border-[#96865d]"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link to="/terms-and-conditions" className="text-[#96865d] hover:underline">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="text-[#96865d] hover:underline">
                      Privacy Policy
                    </Link>
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
              <div className="mt-6" data-aos="fade-up" data-aos-delay="600">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? "Creating account..." : "Register"}
                </button>
              </div>
            </form>

            {/* Social Sign-up */}
            <div className="mt-8" data-aos="fade-up" data-aos-delay="700">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-sm text-gray-500 absolute">
                  Or sign up with
                </span>
              </div>

              <div className="mt-5 flex gap-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => console.log("Google signup")}
                >
                  <FcGoogle size={20} />
                  <span className="text-sm font-medium">Google</span>
                </button>

                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => console.log("Facebook signup")}
                >
                  <FaFacebook size={20} className="text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </div>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="800">
              Already have an account?{" "}
              <Link to="/login" className="text-[#96865d] font-semibold hover:underline">
                Sign in
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