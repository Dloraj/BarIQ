import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Codal from "@/models/Codal";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (subject) {
      query.subject = subject;
    }
    if (search) {
      query.$or = [
        { articleNumber: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { keywords: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const codals = await Codal.find(query).sort({ articleNumber: 1 });

    return NextResponse.json({ success: true, codals });
  } catch (error) {
    const err = error as Error;
    console.error("Fetch codals error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch codals" },
      { status: 500 }
    );
  }
}
