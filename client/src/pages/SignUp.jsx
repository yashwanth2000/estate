import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import OAuth from "../components/OAuth";
import { ToastContainer, toast, Zoom } from "react-toastify";

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      setLoading(true);
      const res = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (data.success === false) {
        if (data.message.includes("username")) {
          setError("User already exists.");
        } else if (data.message.includes("email")) {
          setError("Email already exists.");
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      } else {
        setLoading(false);
        setError(null);
        toast.success("Sign up successful! Please log in.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "dark",
          transition: Zoom,
        });
        setTimeout(() => {
          navigate("/login"); 
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      if (
        error instanceof SyntaxError &&
        error.message === "Unexpected end of JSON input"
      ) {
        setError("Server error: Unable to process response.");
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center bg-gray-100 overflow-y-auto mt-8">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-semibold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                onChange={handleChange}
                required
                minLength={4}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                onChange={handleChange}
                required
                pattern={emailRegex.source}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEye className="h-5 w-5" />
                  ) : (
                    <FaEyeSlash className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
            <div className="flex items-center justify-between">
              <div className="h-px bg-gray-300 w-full"></div>
              <span className="mx-4 text-gray-500">OR</span>
              <div className="h-px bg-gray-300 w-full"></div>
            </div>
            <OAuth />
          </form>
          <div className="mt-4 text-center">
            <p className="inline-block text-gray-600 mr-2">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:underline"
            >
              LogIn
            </Link>
          </div>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default SignUp;
