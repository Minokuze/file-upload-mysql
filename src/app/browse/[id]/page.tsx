"use client";

import { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Enhanced pipe function to handle empty cells and dash values
const pipe = (value: any): JSX.Element | string => {
  // If the value is null or undefined, treat it as an empty string.
  if (value === null || value === undefined) {
    return <span className="text-gray-500">—</span>;
  }

  // For non-object values, convert to string and trim it.
  if (typeof value !== "object") {
    const strValue = String(value).trim();
    if (strValue === "" || strValue === "-" || strValue === "--") {
      return <span className="text-gray-500">—</span>;
    }
    return strValue;
  }

  // For object values, check if the object is empty.
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) {
      return <span className="text-gray-500">—</span>;
    }
    // If the object has a "result" property, use it for rendering.
    if ("result" in value) {
      const result = value.result;
      const resStr =
        result !== null && result !== undefined ? String(result).trim() : "";
      if (resStr === "" || resStr === "-" || resStr === "--") {
        return <span className="text-gray-500">—</span>;
      }
      return resStr;
    }
    // Otherwise, convert the object to a string.
    return JSON.stringify(value);
  }

  // Fallback: return the value as is.
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

  // Derive headers from the first row of data, if available.
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
                <td key={idx}>{pipe(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
