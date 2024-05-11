import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/user/userSlice";
import { AiFillGoogleCircle } from "react-icons/ai";
import { ToastContainer, toast, Zoom } from "react-toastify";

export default function OAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch("/auth/google", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = res.json();
      dispatch(loginSuccess(data));
      toast.success("Sign in with Google successful!", {
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
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log("Could not authenticate with Google", error);
    }
  };
  return (
    <button
      type="button"
      className="flex items-center justify-center w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      Continue with Google
      <ToastContainer />
    </button>
  );
}
