import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BannerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bannerUrl: string) => void;
}

const BannerUploadModal: React.FC<BannerUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setIsValidFile(false);
    if (selectedFile) {
      if (selectedFile.size > 6 * 1024 * 1024) {
        toast.error("File too large. Please select an image smaller than 6MB.");
        setFile(null);
        return;
      }
      if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
        toast.error("Invalid file type. Please select a JPEG or PNG image.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setIsValidFile(true);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-banner", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success("Banner uploaded successfully.");
      if (onSuccess) {
        onSuccess(data.bannerUrl);
      }
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload banner. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>Upload Banner Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hover:cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <Button
            onClick={handleUpload}
            disabled={!file || !isValidFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BannerUploadModal;
