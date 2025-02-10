// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Save file to MySQL
  await pool.query(
    "INSERT INTO files (filename, file_data) VALUES (?, ?)",
    [file.name, buffer]
  );

  // Convert to JSON
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  const jsonData: any[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value;
      rowData[header as string] = cell.value;
    });

    jsonData.push(rowData);
  });

  return NextResponse.json(jsonData);
}
