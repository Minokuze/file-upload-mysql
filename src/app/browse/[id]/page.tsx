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
  const [searchText, setSearchText] = useState(""); // Holds user input
  const [filter, setFilter] = useState(""); // Holds actual filter value
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

// Derive headers from the first row if available, excluding "Timestamp" and blank headers
const headers =
  fileData.data.length > 0
    ? Object.keys(fileData.data[0]).filter(
        (h) => h.trim() !== "" && h !== "Timestamp"
      )
    : [];


// Filter out rows where all non-Timestamp values are blank
const filteredData = fileData.data
  .filter((row: any) =>
    headers.some((header) =>
      String(row[header]).trim() !== "" && row[header] !== null && row[header] !== undefined
    )
  )
  .filter((row: any) =>
    headers.some((header) =>
      String(row[header]).toLowerCase().includes(filter.toLowerCase())
    )
  );


  // Function to apply filter when clicking the button
  const handleFilter = () => {
    setFilter(searchText);
  };

  // Function to export filtered data as an XLSX file with a custom filename
  const exportFilteredData = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    // Remove "Timestamp" field from each row before exporting
    const cleanedData = filteredData.map((row: any) => {
      const newRow: any = {};
      for (const key in row) {
        if (key !== "Timestamp") {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Convert the cleaned data (array of objects) to a worksheet.
    const ws = XLSX.utils.json_to_sheet(cleanedData);
    // Append the worksheet to the workbook.
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");

    // Determine the filename. Append ".xlsx" if not already present.
    let filename = exportFilename.trim();
    if (!filename.toLowerCase().endsWith(".xlsx")) {
      filename += ".xlsx";
    }
    // Trigger a download of the XLSX file.
    XLSX.writeFile(wb, filename);
    setShowExportModal(false); // Close modal after exporting
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">File: {fileData.filename}</h1>

      {/* Filter Input & Button */}
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Filter list..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
        <button className="btn btn-accent" onClick={handleFilter}>
          Filter
        </button>
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
            <h3 className="font-bold text-lg">Enter Export Filename</h3>
            <p className="py-4">
              Provide a filename for your exported data (without extension):
            </p>
            <input
              type="text"
              placeholder="Enter export filename"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              className="input input-bordered w-full mb-4"
            />
            <div className="modal-action">
              <button className="btn btn-primary" onClick={exportFilteredData}>
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
          {filteredData.map((row: any, rowIndex: number) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {header === "Leave Permission\r\nColumn from Mgr" ? (
                    <select
                      className="select select-bordered w-full"
                      value={row[header] || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFileData((prev: any) => {
                          // Find the actual index of the row in the original fileData.data
                          const actualIndex = prev.data.findIndex((r: any) => r === row);
                          if (actualIndex === -1) return prev; // Safety check
                          
                          // Create a new data array with the updated row
                          const newData = [...prev.data];
                          newData[actualIndex] = { ...newData[actualIndex], [header]: newValue };

                          return { ...prev, data: newData };
                        });
                      }}
                    >
                      <option value="">-- Choose --</option>
                      <option value="Accept">Accept</option>
                      <option value="Reject">Reject</option>
                      <option value="Cancel request">Cancel request</option>
                    </select>

                  ) : (
                    pipe(row[header])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
