const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: "uploads", // Folder name in Cloudinary
//       resource_type: "raw", // Auto-detect file type (image, raw, video, etc.)
//       allowed_formats: ["zip", "jpg", "png", "jpeg", "pdf"], // Allow specific formats
//   },
//   });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  // params: {
  //   folder: "zip", // Cloudinary folder where files will be stored
  //   resource_type: "raw", // Use "raw" for non-image files like .zip
  // },
  params: {
    folder: "uploads", // Folder where files will be stored on Cloudinary
    resource_type: "auto", // Automatically detect resource type (e.g., image, raw, video)
    format: async (req, file) => {
      // Change the file extension dynamically
      return file.mimetype === "application/x-zip-compressed" ? "zip" : "png";
    },
    public_id: (req, file) => {
      // Generate a new filename dynamically
      const timestamp = Date.now();
      return `custom_name_${timestamp}`; // Replace 'custom_name' with your logic
    },
  },
});

  module.exports={
    cloudinary,
    storage
  }