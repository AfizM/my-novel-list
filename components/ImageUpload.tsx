import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_cloudinary_upload_preset");

        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
            {
              method: "POST",
              body: formData,
            },
          );
          const data = await response.json();
          onChange(data.secure_url);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover rounded-md"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
            isDragActive ? "border-primary" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>Drag & drop an image here, or click to select one</p>
          )}
        </div>
      )}
    </div>
  );
};
