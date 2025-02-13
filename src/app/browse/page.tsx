"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Download, Trash2 } from "lucide-react";

interface File {
  id: number;
  filename: string;
  upload_date: string;
}

export default function BrowsePage() {
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

  // When the Delete button is clicked, open the modal and save the id to be deleted.
  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowModal(true);
  };

  // Delete function sends a DELETE request to the API.
  const deleteFile = async () => {
    if (deleteId === null) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/delete/${deleteId}`, {
        method: "DELETE",
      });
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
      setShowModal(false); // Close modal after deletion
    }
  };

  return (
    <div className="container mx-auto my-10 p-5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Folder className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Uploaded Files</h1>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-0">
              <table className="table table-zebra w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3">Filename</th>
                    <th className="px-4 py-3">Upload Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-100">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/browse/${file.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          {file.filename}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(file.upload_date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 flex gap-2 justify-center">
                        <button
                          className="btn btn-sm btn-primary flex items-center gap-1"
                          onClick={() => downloadFile(file.id)}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          className="btn btn-sm btn-error flex items-center gap-1"
                          onClick={() => openDeleteModal(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-semibold mb-2">
                Are you sure you want to delete this file?
              </h2>
              <p className="text-gray-500 mb-4">
                This action cannot be undone.
              </p>
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
}
