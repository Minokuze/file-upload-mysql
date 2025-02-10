// src/app/api/download/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const fileId = params.id;

  const [rows]: any = await pool.query("SELECT filename, file_data FROM files WHERE id = ?", [fileId]);

  if (rows.length === 0) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const file = rows[0];

  return new NextResponse(file.file_data, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
}
