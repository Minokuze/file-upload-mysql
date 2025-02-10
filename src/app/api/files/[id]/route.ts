import { NextResponse } from "next/server";
import pool from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Await params to ensure it is resolved
  const { id } = await params;

  const [rows] = await pool.query("SELECT filename, file_data FROM files WHERE id = ?", [id]);

  if (rows.length === 0) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const { filename, file_data } = rows[0];

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file_data);

  const worksheet = workbook.worksheets[0];
  const jsonData: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value;
      rowData[header as string] = cell.value;
    });
    jsonData.push(rowData);
  });

  return NextResponse.json({ filename, data: jsonData });
}
