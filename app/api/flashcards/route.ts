import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import mongoose from "mongoose";

// Leitner system intervals in days
const BOX_INTERVALS: { [key: number]: number } = {
  1: 1,  // 1 day
  2: 3,  // 3 days
  3: 7,  // 7 days
  4: 14, // 14 days
  5: 30, // 30 days
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subject = searchParams.get("subject");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
    if (subject) {
      query.subject = subject;
    }

    // Retrieve cards that are due for review (nextReviewDate <= now)
    // Or we can retrieve all cards and sort them to show due ones first
    const now = new Date();
    const flashcards = await Flashcard.find(query).sort({ nextReviewDate: 1 });

    // Separate into due and pending for detailed frontend insight
    const dueCards = flashcards.filter(c => new Date(c.nextReviewDate) <= now);

    // Premium helper: If user has 0 flashcards total, seed default cards for them!
    if (flashcards.length === 0) {
      const defaultCards = [
        {
          userId: new mongoose.Types.ObjectId(userId),
          subject: "Civil Law",
          front: "Define 'Obligation' under Article 1156 of the Civil Code.",
          back: "An obligation is a juridical necessity to give, to do or not to do.",
          sourceArticle: "Article 1156, Civil Code",
          box: 1,
          nextReviewDate: now,
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          subject: "Civil Law",
          front: "Name the five sources of obligations.",
          back: "1. Law\n2. Contracts\n3. Quasi-contracts\n4. Acts or omissions punished by law (Delicts)\n5. Quasi-delicts (Torts)",
          sourceArticle: "Article 1157, Civil Code",
          box: 1,
          nextReviewDate: now,
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          subject: "Civil Law",
          front: "What is a 'Quasi-delict'?",
          back: "It is an act or omission that causes damage to another, there being fault or negligence, but no pre-existing contractual relation between the parties.",
          sourceArticle: "Article 2176, Civil Code",
          box: 1,
          nextReviewDate: now,
        },
        {
          userId: new mongoose.Types.ObjectId(userId),
          subject: "Criminal Law",
          front: "What is a felony?",
          back: "Acts and omissions punishable by law are felonies (delitos) when committed not only by means of deceit (dolo) but also by means of fault (culpa).",
          sourceArticle: "Article 3, Revised Penal Code",
          box: 1,
          nextReviewDate: now,
        },
      ];
      const newlySeeded = await Flashcard.insertMany(defaultCards);
      return NextResponse.json({
        success: true,
        flashcards: newlySeeded,
        dueCount: newlySeeded.length,
        totalCount: newlySeeded.length,
      });
    }

    return NextResponse.json({
      success: true,
      flashcards,
      dueCount: dueCards.length,
      totalCount: flashcards.length,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Flashcards GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}

// Update card score (Leitner SRS rating)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { cardId, wasCorrect } = body;

    if (!cardId) {
      return NextResponse.json({ success: false, error: "cardId is required" }, { status: 400 });
    }

    const card = await Flashcard.findById(cardId);
    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    let nextBox = card.box;
    if (wasCorrect) {
      nextBox = Math.min(5, card.box + 1); // Upgrade box (max 5)
    } else {
      nextBox = 1; // Demote to box 1 immediately on mistake
    }

    const daysToAdd = BOX_INTERVALS[nextBox];
    const newNextReviewDate = new Date();
    newNextReviewDate.setDate(newNextReviewDate.getDate() + daysToAdd);

    card.box = nextBox;
    card.nextReviewDate = newNextReviewDate;
    await card.save();

    return NextResponse.json({ success: true, card });
  } catch (error) {
    const err = error as Error;
    console.error("Flashcards POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update flashcard" },
      { status: 500 }
    );
  }
}

// Create new custom flashcard
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, subject, front, back, sourceArticle } = body;

    if (!userId || !subject || !front || !back) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newCard = await Flashcard.create({
      userId: new mongoose.Types.ObjectId(userId),
      subject,
      front,
      back,
      sourceArticle,
      box: 1,
      nextReviewDate: new Date(),
    });

    return NextResponse.json({ success: true, card: newCard });
  } catch (error) {
    const err = error as Error;
    console.error("Flashcard creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create flashcard" },
      { status: 500 }
    );
  }
}
