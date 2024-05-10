import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import {useNavigate} from "react-router-dom";
import { loginSuccess } from "../redux/user/userSlice";

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
      navigate("/"); 
    } catch (error) {
      console.log("Could not authenticate with Google", error);
    }
  };
  return (
    <button
      type="button"
      className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition-colors"
      onClick={handleGoogleClick}
    >
      Continue with Google
    </button>
  );
}
