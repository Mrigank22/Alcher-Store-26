import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const products = await Product.find().lean();

  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=products.xlsx",
    },
  });
}
