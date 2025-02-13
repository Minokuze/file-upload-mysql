import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Await params to ensure it is resolved
  const { id } = await params;

  const [rows, fields]:[any[], any[]] = await pool.query("SELECT filename, file_data FROM files WHERE id = ?", [id]);

  if (rows.length === 0)
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const { filename, file_data } = rows[0];

  // Read the file buffer using SheetJS
  const workbook = XLSX.read(file_data, { type: "buffer" });

  // Assuming you are working with the first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Use sheet_to_json to convert sheet to JSON and handle empty cells
  // Set defval to an empty string to ensure empty cells are included as empty values
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: "", // Use an empty string for empty cells
    header: 1,  // Consider the first row as headers
  });

  // Convert the array of arrays (because we used header: 1) into an array of objects
  const headers:any = jsonData[0]; // First row as header
  const rowsData = jsonData.slice(1); // All subsequent rows are the actual data

  const formattedData = rowsData.map((row: any) => {
    const rowData: any = {};
    headers.forEach((header: string | number, index: string | number) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  return NextResponse.json({ filename, data: formattedData });
}

// PUT: Save the modified Excel data back to the database
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { data } = await req.json(); // The updated table data

    // Convert JSON data back into an Excel buffer
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write to buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Update MySQL with new file data
    await pool.query("UPDATE files SET file_data = ? WHERE id = ?", [excelBuffer, id]);

    return NextResponse.json({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}
