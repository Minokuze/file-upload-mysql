"use client";

import { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Updated pipe function to handle empty cells more robustly
const pipe = (value: any): JSX.Element | string => {
  // Check for explicit null, undefined or empty string
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-500">—</span>;
  }

  // If the value is an object, handle it further
  if (typeof value === "object") {
    // If the object is empty, return the placeholder
    if (Object.keys(value).length === 0) {
      return <span className="text-gray-500">—</span>;
    }

    // If the object has a "result" property, use that value if it exists and is not empty
    if ("result" in value) {
      const result = value.result;
      if (result === null || result === undefined || result === "") {
        return <span className="text-gray-500">—</span>;
      }
      return result;
    }

    // Otherwise, for non-empty objects, try stringifying them (or customize as needed)
    return JSON.stringify(value);
  }

  // For non-object, non-empty values, return them as is
  return value;
};

export default function FileContentsPage() {
  const { id } = useParams();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/files/${id}`);
      const data = await res.json();
      setFileData(data);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  // Ensure headers are derived from the first row
  const headers = fileData.data.length > 0 ? Object.keys(fileData.data[0]) : [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">File: {fileData.filename}</h1>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {headers.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fileData.data.map((row: any, index: number) => (
            <tr key={index}>
              {headers.map((header, idx) => (
                <td key={idx}>{pipe(row[header])}</td> // Ensure you reference the header for each row
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
