import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "List reviews - not implemented", reviews: [] },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Create review - not implemented" },
    { status: 501 }
  );
}
