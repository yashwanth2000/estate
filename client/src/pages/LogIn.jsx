import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

const LogIn = () => {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid = () => {
    const { email, password } = formData;
    return password.length >= 4 && emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(loginStart());
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      //console.log("Server response:", data);

      if (!isFormValid()) {
        dispatch(loginFailure("Please enter valid credentials."));
        return;
      }

      if (data.rest) {
        //console.log("User data from server:", data.rest);
        dispatch(loginSuccess(data));
        navigate("/");
      } else {
        //console.log("Login failed:", data.message);
        dispatch(loginFailure(data.message));
      }
    } catch (error) {
      if (
        error instanceof SyntaxError &&
        error.message === "Unexpected end of JSON input"
      ) {
        dispatch(loginFailure("Server error: Unable to process response."));
      } else {
        dispatch(loginFailure(error.message));
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 overflow-y-auto mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Loading..." : "LogIn"}
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
            Dont have an account?
          </p>
          <Link
            to="/sign-up"
            className="inline-block text-blue-600 hover:underline"
          >
            SignUp
          </Link>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default LogIn;
