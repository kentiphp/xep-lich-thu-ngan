import { NextResponse } from "next/server";
import { getPreferences, savePreferences } from "@/lib/db";

export async function GET() {
  try {
    const preferences = await getPreferences();
    return NextResponse.json(preferences);
  } catch (err) {
    console.error("Failed to fetch preferences:", err);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const preferences = await request.json();
    await savePreferences(preferences);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save preferences:", err);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
