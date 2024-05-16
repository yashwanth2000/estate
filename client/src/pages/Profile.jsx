import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { app } from "../firebase";
import { Link } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  updateUserSuccess,
  updateUserStart,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  logOutSuccess,
  logOutStart,
  logOutFailure,
} from "../redux/user/userSlice";
import { Slide, toast, ToastContainer, Zoom } from "react-toastify";

const Profile = () => {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const avatarUrl =
    currentUser &&
    (currentUser.rest ? currentUser.rest.avatar : currentUser.avatar);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(Math.round(progress));
      },
      (error) => {
        console.error("File upload error:", error);
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = currentUser.rest ? currentUser.rest._id : currentUser._id;
      const initialUserData = {
        username: currentUser.rest
          ? currentUser.rest.username
          : currentUser.username,
        email: currentUser.rest ? currentUser.rest.email : currentUser.email,
        avatar: currentUser.rest ? currentUser.rest.avatar : currentUser.avatar,
      };

      // Check if any form data has changed
      const hasChanges = Object.keys(formData).some(
        (key) => formData[key] !== initialUserData[key]
      );

      if (!hasChanges) {
        toast.info("No changes were made.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "dark",
          transition: Slide,
        });
        return;
      }

      dispatch(updateUserStart());
      const res = await fetch(`/user/update/${userId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
        transition: Zoom,
      });
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const userId = currentUser.rest ? currentUser.rest._id : currentUser._id;
      const res = await fetch(`/user/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleLogOut = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/auth/logout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(logOutFailure(data.message));
        return;
      }
      dispatch(logOutSuccess(data));
    } catch (error) {
      dispatch(logOutFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const userId = currentUser.rest ? currentUser.rest._id : currentUser._id;
      const res = await fetch(`/user/listings/${userId}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          className=""
          accept="image/*"
          ref={fileRef}
          hidden
        />
        <img
          src={formData.avatar || avatarUrl}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover mb-6 mx-auto"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center mb-4">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePercentage}%`}</span>
          ) : filePercentage === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <div className="mb-4">
          <label htmlFor="username" className="block font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full border-2 border-gray-300 p-2 rounded-md"
            defaultValue={
              currentUser && currentUser.rest
                ? currentUser.rest.username
                : currentUser.username
            }
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border-2 border-gray-300 p-2 rounded-md"
            defaultValue={
              currentUser && currentUser.rest
                ? currentUser.rest.email
                : currentUser.email
            }
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border-2 border-gray-300 p-2 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 mb-4"
          >
            {loading ? "Loading..." : "Update Profile"}
          </button>
          <Link
            className="bg-green-600 w-full py-2 text-white px-4 rounded-md text-center hover:bg-green-700 transition-colors duration-300 mb-4"
            to="/create-listing"
          >
            Create Listing
          </Link>
        </div>
      </form>
      <div className="flex justify-between mt-6 w-full">
        <button
          className="text-red-600 hover:text-red-700 transition-colors duration-300"
          onClick={handleDeleteUser}
        >
          Delete Account
        </button>
        <button
          className="text-red-600 hover:text-red-700 transition-colors duration-300"
          onClick={handleLogOut}
        >
          Sign Out
        </button>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col item-center">
                <button className="text-red-700 uppercase" onClick={() => handleListingDelete(listing._id)}>Delete</button>
                <button className="text-green-700 uppercase">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Profile;
