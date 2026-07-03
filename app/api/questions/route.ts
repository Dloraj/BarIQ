import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {};
    if (subject) {
      query.subject = subject;
    }
    if (type) {
      query.type = type;
    }

    const questions = await Question.find(query);

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    const err = error as Error;
    console.error("Fetch questions error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
