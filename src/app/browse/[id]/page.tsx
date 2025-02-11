"use client";

import { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";

// Enhanced pipe function to handle empty cells and dash values
const pipe = (value: any): JSX.Element | string => {
  if (value === null || value === undefined) {
    return <span className="text-gray-500">—</span>;
  }
  if (typeof value !== "object") {
    const strValue = String(value).trim();
    if (strValue === "" || strValue === "-" || strValue === "--") {
      return <span className="text-gray-500">—</span>;
    }
    return strValue;
  }
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) {
      return <span className="text-gray-500">—</span>;
    }
    if ("result" in value) {
      const result = value.result;
      const resStr =
        result !== null && result !== undefined ? String(result).trim() : "";
      if (resStr === "" || resStr === "-" || resStr === "--") {
        return <span className="text-gray-500">—</span>;
      }
      return resStr;
    }
    return JSON.stringify(value);
  }
  return value;
};

export default function FileContentsPage() {
  const { id } = useParams();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [exportFilename, setExportFilename] = useState("filtered_data");
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Derive headers from the first row if available.
  const headers =
    fileData.data.length > 0 ? Object.keys(fileData.data[0]) : [];

  // Filter the data: a row is included if any cell contains the filter text (case-insensitive)
  const filteredData = fileData.data.filter((row: any) =>
    headers.some((header) =>
      String(row[header]).toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Export function: exports filtered data as an XLSX file using the provided filename.
  const exportFilteredData = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    // Create a new workbook and worksheet from filtered data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");

    // Append .xlsx extension if not present.
    let filename = exportFilename.trim();
    if (!filename.toLowerCase().endsWith(".xlsx")) {
      filename += ".xlsx";
    }

    XLSX.writeFile(wb, filename);
    setShowExportModal(false); // Close modal after exporting
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">
        File: {fileData.filename}
      </h1>

      {/* Filter Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter list..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      {/* Export Button */}
      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowExportModal(true)}
        >
          Export Filtered Data
        </button>
      </div>

      {/* Modal for Custom Filename Input */}
      {showExportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Enter Export Filename
            </h3>
            <p className="py-4">
              Provide a filename for your exported data:
            </p>
            <input
              type="text"
              placeholder="Enter export filename (without extension)"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              className="input input-bordered w-full mb-4"
            />
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={exportFilteredData}
              >
                Export
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {headers.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row: any, index: number) => (
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
