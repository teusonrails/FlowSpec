import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { message: "Stripe webhook - not implemented" },
    { status: 501 }
  );
}
