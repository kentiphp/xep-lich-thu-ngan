import { NextResponse } from "next/server";
import { getSchedule, saveSchedule } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");

    if (!weekStart) {
      return NextResponse.json(
        { error: "weekStart parameter required" },
        { status: 400 }
      );
    }

    const schedule = await getSchedule(weekStart);
    return NextResponse.json(schedule);
  } catch (err) {
    console.error("Failed to fetch schedule:", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { weekStart, schedule } = await request.json();

    if (!weekStart || !schedule) {
      return NextResponse.json(
        { error: "weekStart and schedule required" },
        { status: 400 }
      );
    }

    await saveSchedule(weekStart, schedule);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save schedule:", err);
    return NextResponse.json(
      { error: "Failed to save schedule" },
      { status: 500 }
    );
  }
}
