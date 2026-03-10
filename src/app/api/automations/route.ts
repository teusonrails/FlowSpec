import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "List automations - not implemented", automations: [] },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Create automation - not implemented" },
    { status: 501 }
  );
}
