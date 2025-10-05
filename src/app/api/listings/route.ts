
import { getPaginatedListings } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cursor, pageSize, filters } = await req.json();
    const result = await getPaginatedListings(cursor, pageSize, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in listings API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
