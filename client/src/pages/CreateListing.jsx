import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CreateListing() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bathrooms: 1,
    bedrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
          console.log(err);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      setLoading(true);
      setError(false);
      const res = await fetch("/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id || currentUser.rest._id,
        }),
      });
      const data = await res.json();
      
      setLoading(false);
      if (data.success === false) {
       
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">Create a Listing</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div>
          <input
            type="text"
            placeholder="Name"
            className="border-2 border-gray-300 p-3 rounded-lg w-full mb-4"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border-2 border-gray-300 p-3 rounded-lg w-full mb-4"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border-2 border-gray-300 p-3 rounded-lg w-full mb-4"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Property Type</h3>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sale"
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData.type === "sale"}
                />
                <label htmlFor="sale" className="ml-2">
                  Sell
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rent"
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData.type === "rent"}
                />
                <label htmlFor="rent" className="ml-2">
                  Rent
                </label>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData.parking}
                />
                <label htmlFor="parking" className="ml-2">
                  Parking spot
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData.furnished}
                />
                <label htmlFor="furnished" className="ml-2">
                  Furnished
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="offer"
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData.offer}
                />
                <label htmlFor="offer" className="ml-2">
                  Offer
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-sm font-semibold mb-1"
              >
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="border-2 border-gray-300 p-2 rounded-lg w-full"
                onChange={handleChange}
                value={formData.bedrooms}
              />
            </div>
            <div>
              <label
                htmlFor="bathrooms"
                className="block text-sm font-semibold mb-1"
              >
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="border-2 border-gray-300 p-2 rounded-lg w-full"
                onChange={handleChange}
                value={formData.bathrooms}
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div>
              <label
                htmlFor="regularPrice"
                className="block text-sm font-semibold mb-1"
              >
                Regular Price
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="regularPrice"
                  min="50"
                  max="10000"
                  required
                  className="border-2 border-gray-300 p-2 rounded-lg w-full"
                  onChange={handleChange}
                  value={formData.regularPrice}
                />
                <span className="ml-2 text-gray-500">$ / month</span>
              </div>
            </div>
            {formData.offer && (
              <div>
                <label
                  htmlFor="discountPrice"
                  className="block text-sm font-semibold mb-1"
                >
                  Discounted Price
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="discountPrice"
                    min="0"
                    max="1000"
                    required
                    className="border-2 border-gray-300 p-2 rounded-lg w-full"
                    onChange={handleChange}
                    value={formData.discountPrice}
                  />
                  <span className="ml-2 text-gray-500">$ / month</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <p className="text-sm text-gray-500 mb-2">
              The first image will be the cover (max 6)
            </p>
            <div className="flex items-center mb-2">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="border-2 border-gray-300 rounded-lg p-2 w-full"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />
              <button
                type="button"
                disabled={uploading}
                onClick={handleImageUpload}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            {imageUploadError && (
              <p className="text-red-500 text-sm">{imageUploadError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt="listing image"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-full"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <button
              disabled={loading || uploading}
              className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg ${
                loading || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading || uploading ? "Loading..." : "Create Listing"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </form>
    </main>
  );
}
