// app/upload/page.tsx
"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const jsonData = await res.json();
      setData(jsonData);
      setFile(null);
      alert("Upload successfully!");
    }
    else {
      alert("Upload failed. Please try again.");}
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6 bg-base-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        📤 Upload and Filter Excel Data
      </h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="file-input file-input-bordered w-full max-w-xs"
      />

      <button
        onClick={handleUpload}
        className="btn btn-primary"
      >
        Upload
      </button>
    </div>

  );
}
