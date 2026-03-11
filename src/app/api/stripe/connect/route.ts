import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Stripe Connect onboarding - not implemented" },
    { status: 501 }
  );
}
