// app/api/delete/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const fileId = params.id;

  try {
    // Attempt to delete the file from the database
    const result = await pool.query("DELETE FROM files WHERE id = ?", [fileId]);

    // Check if the file was found and deleted
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
