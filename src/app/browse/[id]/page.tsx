"use client";

import { JSX, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { ArrowLeft, FileText, Filter, FolderDown, X, Save } from "lucide-react";


const FALLBACK = <span className="text-gray-500">—</span>

const isEmptyString = (str:String):boolean=>
  str==="" || str==="-" || str==="_" || str==="." || str==="..";

const pipe = (value:any): JSX.Element | string =>{
  //Handle null or undefined
  if(value==null) return FALLBACK;

  //Handle non-object values
  if(typeof value !== "object"){
    const strValue = String(value).trim();
    return isEmptyString(strValue) ? FALLBACK : strValue;
  }

  //Handle object values
  //return fallback if the object is empty
  if(Object.keys(value).length === 0)
    return FALLBACK;
  if("result" in value) {
    const result =value.result;
    const resultStr = result != null ? String(result).trim() : "";
    return isEmptyString(resultStr) ? FALLBACK : resultStr;
  }

  //for other objects, return the JSON stringfied version
  return JSON.stringify(value);
}

export default function FileContentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); // Holds user input
  const [filter, setFilter] = useState(""); // Holds actual filter value
  const [exportFilename, setExportFilename] = useState("filtered_data");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Derive headers from the first row if available, excluding "Timestamp" and blank headers.
  const headers =
    fileData.data.length > 0
      ? Object.keys(fileData.data[0]).filter(
          (h) => h.trim() !== "" && h !== "Timestamp"
        )
      : [];

  // Filter out rows where all non-Timestamp values are blank, then apply search filter.
  const filteredData = fileData.data
    .filter((row: any) =>
      headers.some(
        (header) =>
          String(row[header]).trim() !== "" &&
          row[header] !== null &&
          row[header] !== undefined
      )
    )
    .filter((row: any) =>
      headers.some((header) =>
        String(row[header]).toLowerCase().includes(filter.toLowerCase())
      )
    );

  // Function to apply filter when clicking the button.
  const handleFilter = () => {
    setFilter(searchText);
  };

  // Function to export filtered data as an XLSX file with a custom filename.
  const exportFilteredData = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    // Remove "Timestamp" field from each row before exporting.
    const cleanedData = filteredData.map((row: any) => {
      const newRow: any = {};
      for (const key in row) {
        if (key !== "Timestamp") {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });

    // Create a new workbook.
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
    setShowExportModal(false); // Close modal after exporting.
  };

  return (
    <div className="p-5 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* ✅ Go Back Button */}
          <button className="btn btn-square btn-outline flex items-center gap-1" onClick={() => router.push("/browse")}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <FileText className="w-10 h-10 text-primary" />
          <h1 className="text-xl sm:text-3xl font-bold text-accent-content ">
            File: {fileData.filename}
          </h1>
        </div>
        {/* Export Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="btn btn-success text-white flex items-center gap-1 px-3 sm:px-4 sm:py-2.5"
            onClick={() => setShowExportModal(true)}
          >
            <FolderDown className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden xs:inline sm:inline">Export</span>
            <span className="hidden md:inline sm:inline">to Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Input & Button */}
      <div className="mb-4 flex flex-wr items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); handleFilter(); }} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter list..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered w-full max-w-xs"
            />
            <button type="submit" className="btn btn-accent text-white flex items-center gap-1">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Save Changes Button */}
      <div className="mb-4  flex items-center gap-2">
        <button
          className="btn btn-primary flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          onClick={async () => {
            setIsSaving(true);
            try {
              const response = await fetch(`/api/files/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(fileData),
              });

              if (!response.ok) {
                throw new Error("Failed to save changes.");
              }

              alert("Changes saved successfully!");
            } catch (error) {
              console.error(error);
              alert("Error saving changes.");
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <div className="hidden sm:inline">Save Changes</div>
            </>
          )}
        </button>
      </div>


      {/* Modal for Custom Filename Input */}
      {showExportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Enter Export Filename</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowExportModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
            onSubmit={(e)=>{
              e.preventDefault();
              if(!exportFilename.trim()){
                alert("Please Enter a filename before exporting.");
                return;
              }
              exportFilteredData();
            }}>
            <p className="py-2">
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
              <button className="btn btn-primary" onClick={exportFilteredData} disabled={!exportFilename.trim()}>
                Export
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowExportModal(false)}
                
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-primary text-white">
            <tr>
              {headers.map((col) => (
                <th key={col} className="px-4 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">

            {filteredData.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {header === "Leave Permission\r\nColumn from Mgr" ? (
                      <select
                        className="select select-bordered w-full"
                        value={row[header] || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setFileData((prev: any) => {
                            // Find the actual index of the row in the original fileData.data
                            const actualIndex = prev.data.findIndex(
                              (r: any) => r === row
                            );
                            if (actualIndex === -1) return prev; // Safety check
                            // Create a new data array with the updated row
                            const newData = [...prev.data];
                            newData[actualIndex] = {
                              ...newData[actualIndex],
                              [header]: newValue,
                            };
                            return { ...prev, data: newData };
                          });
                        }}
                      >
                        <option value="">-- Choose --</option>
                        <option value="Accept">Accept</option>
                        <option value="Reject">Reject</option>
                        <option value="Cancel request">Cancel request</option>
                      </select>
                    ) : header === "Remark from Mgr" ? (
                      <textarea
                        className="textarea textarea-bordered"
                        value={row[header] || ""}
                        onChange={(e)=>{
                          const newvalue = e.target.value;
                          setFileData((prev:any) =>{
                          //find the actual index of the row in the original fileData.data
                          const actualIndex = prev.data.findIndex((r:any) => r===row);
                          if (actualIndex === -1) 
                            return prev; //safety check
                          //Create a new data array with the updated row
                          const newData = [...prev.data];
                          newData[actualIndex] = {
                            ...newData[actualIndex],
                            [header]: newvalue,
                          };
                          return {...prev,data:newData};
                          })
                          
                        }}
                      />
                    )
                     : (
                      pipe(row[header])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
