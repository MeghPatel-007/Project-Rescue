import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connectDB();
  return NextResponse.json({ message: "Connected to MongoDB" });
}
