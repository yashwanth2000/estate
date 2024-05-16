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
  const [showListings, setShowListings] = useState(false);

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
    setShowListings(!showListings);
    if (!showListings) {
      try {
        setShowListingsError(false);
        const userId = currentUser.rest
          ? currentUser.rest._id
          : currentUser._id;
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
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/listing/delete/${listingId}`, {
        method: "DELETE",
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-6">
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileRef}
            />
            <img
              src={formData.avatar || avatarUrl}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover cursor-pointer"
              onClick={() => fileRef.current.click()}
            />
          </div>
          <p className="text-sm text-center text-gray-500 mb-6">
            {fileUploadError ? (
              <span className="text-red-500">
                Error Image upload (image must be less than 2 mb)
              </span>
            ) : filePercentage > 0 && filePercentage < 100 ? (
              <span className="text-gray-700">{`Uploading ${filePercentage}%`}</span>
            ) : filePercentage === 100 ? (
              <span className="text-green-500">
                Image successfully uploaded!
              </span>
            ) : (
              ""
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-bold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                defaultValue={
                  currentUser && currentUser.rest
                    ? currentUser.rest.username
                    : currentUser.username
                }
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                defaultValue={
                  currentUser && currentUser.rest
                    ? currentUser.rest.email
                    : currentUser.email
                }
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-between mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 text-white font-semibold rounded-md transition-colors duration-300 ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Loading..." : "Update Profile"}
            </button>
            <Link
              to="/create-listing"
              className="px-6 py-3 text-white font-semibold bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Create Listing
            </Link>
          </div>
          <div className="flex justify-between mt-4">
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
        </form>

        <p className="text-red-600 mt-4 text-center">{error ? error : ""}</p>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleShowListings}
            className={`px-6 py-3 text-white font-semibold rounded-md transition-colors duration-300 ${
              showListings
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {showListings ? "Hide Listings" : "Show Listings"}
          </button>
        </div>
        <p className="text-red-600 mt-4 text-center">
          {showListingsError ? "Error showing listings" : ""}
        </p>

        {showListings && userListings && userListings.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <Link to={`/listing/${listing._id}`}>
                    <img
                      src={listing.imageUrls[0]}
                      alt="listing cover"
                      className="h-48 w-full object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link
                      className="text-gray-800 font-semibold hover:underline truncate"
                      to={`/listing/${listing._id}`}
                    >
                      <p>{listing.name}</p>
                    </Link>
                    <div className="flex justify-between mt-4">
                      <button
                        className="px-3 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-300"
                        onClick={() => handleListingDelete(listing._id)}
                      >
                        Delete
                      </button>
                      <button className="px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors duration-300">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <ToastContainer />
      </main>
    </div>
  );
};

export default Profile;
