// app/upload/page.tsx
"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

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
    }
  };

  const handleExport = async () => {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        data.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
        )
      ),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "filtered_data.xlsx";
      a.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">📤 Upload and Filter Excel Data</h1>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="mb-4 p-2 border rounded-md"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Upload
      </button>

      {data.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <input
            type="text"
            placeholder="🔍 Enter filter keyword..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded-md mb-4"
          />
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Export Filtered Data
          </button>

          <div className="mt-4 bg-white p-4 rounded shadow">
            <h2 className="font-bold">📄 Preview:</h2>
            <pre className="overflow-x-auto text-sm max-h-60">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
