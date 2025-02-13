"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
        setFile(null);

        // Reset the input field using ref
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        alert("Upload successfully!");
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card shadow-lg bg-white p-6 w-full max-w-md">
        <div className="card-body items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <UploadCloud className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Upload Excel Files</h1>
          </div>

          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="file-input file-input-bordered w-full max-w-xs"
            disabled={isUploading}
          />

          <button
            onClick={handleUpload}
            className={`btn btn-primary mt-4 w-full ${isUploading ? "btn-disabled" : ""}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>

          {/* Show "Go to Uploaded File" button if data exists */}
          {data.length > 0 && (
            <button
              onClick={() => router.push("/browse")}
              className="btn btn-secondary mt-4 w-full"
            >
              Go to Uploaded File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
