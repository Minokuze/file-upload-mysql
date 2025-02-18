import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save file to MySQL
  await pool.query(
    "INSERT INTO files (filename, file_data) VALUES (?, ?)",
    [file.name, buffer]
  );

  // Parse Excel file using xlsx
  const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  return NextResponse.json(jsonData);
}
