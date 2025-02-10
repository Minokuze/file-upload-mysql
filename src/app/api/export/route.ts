// app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Filtered Data");

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
    data.forEach((item: any) => worksheet.addRow(item));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="filtered_data.xlsx"',
    },
  });
}
