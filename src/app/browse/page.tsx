"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface File {
  id: number;
  filename: string;
  upload_date: string;
}

const BrowsePage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch("/api/files");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    }

    fetchFiles();
  }, []);

  const downloadFile = (id: number) => {
    window.open(`/api/download/${id}`, "_blank");
  };

  const deleteFile = async () => {
    if (deleteId === null) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/delete/${deleteId}`, { method: "DELETE" });
      if (response.ok) {
        // Refresh file list after deletion
        setFiles(files.filter((file) => file.id !== deleteId));
      } else {
        console.error("Error deleting file.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      setShowModal(false);  // Close modal after deletion
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto my-10 p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-primary">📂 Uploaded Files</h1>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr
                  key={file.id}
                  className={`hover:bg-gray-200 `}
                >
                  <td className="px-4 py-3 font-medium">
                  <Link href={`/browse/${file.id}`} className="text-blue-500 hover:underline">
                    {file.filename}
                  </Link>
                  </td>
                  <td className="px-4 py-3">{new Date(file.upload_date).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => downloadFile(file.id)}
                    >
                      📥 Download
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => openDeleteModal(file.id)}
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-semibold">Are you sure you want to delete this file?</h2>
              <p className="text-gray-500">This action cannot be undone.</p>
              <div className="modal-action">
                <button
                  className="btn btn-sm btn-error"
                  onClick={deleteFile}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
