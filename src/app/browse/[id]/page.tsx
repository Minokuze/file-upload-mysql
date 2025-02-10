"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">File: {fileData.filename}</h1>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {Object.keys(fileData.data[0] || {}).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fileData.data.map((row: any, index: number) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
