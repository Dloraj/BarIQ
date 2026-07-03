import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ExamResponse from "@/models/ExamResponse";
import Flashcard from "@/models/Flashcard";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Gather all exam responses
    const responses = await ExamResponse.find({ userId: userObjectId });
    const mcqResponses = responses.filter(r => r.type === "MCQ");
    const essayResponses = responses.filter(r => r.type === "Essay");

    // Compute MCQ metrics
    const totalMcqs = mcqResponses.length;
    const correctMcqs = mcqResponses.filter(r => r.isCorrect).length;
    const mcqAccuracy = totalMcqs > 0 ? Math.round((correctMcqs / totalMcqs) * 100) : 0;

    // Compute Essay metrics
    const totalEssays = essayResponses.length;
    const averageEssayScore = totalEssays > 0 
      ? Math.round(essayResponses.reduce((acc, r) => acc + (r.score || 0), 0) / totalEssays)
      : 0;

    // 2. Gather flashcard statistics
    const flashcards = await Flashcard.find({ userId: userObjectId });
    const totalFlashcards = flashcards.length;
    
    const now = new Date();
    const dueFlashcards = flashcards.filter(c => new Date(c.nextReviewDate) <= now).length;

    // Leitner box distributions
    const boxDistribution = {
      box1: flashcards.filter(c => c.box === 1).length,
      box2: flashcards.filter(c => c.box === 2).length,
      box3: flashcards.filter(c => c.box === 3).length,
      box4: flashcards.filter(c => c.box === 4).length,
      box5: flashcards.filter(c => c.box === 5).length,
    };

    // Calculate simulated Bar Readiness (combines MCQ accuracy, Essay averages, and SRS progress)
    // Formula: (MCQ Accuracy * 0.4) + (Essay Avg * 0.4) + (SRS Memorized % * 0.2)
    // Box 4 and Box 5 are considered "memorized"
    const memorizedCardsCount = flashcards.filter(c => c.box >= 4).length;
    const srsCompletionRate = totalFlashcards > 0 ? (memorizedCardsCount / totalFlashcards) * 100 : 0;
    
    // Default readiness is 0, but if they have done nothing, display a base value or 0
    let barReadiness = 0;
    if (totalMcqs > 0 || totalEssays > 0 || totalFlashcards > 0) {
      const activeMcqWeight = totalMcqs > 0 ? mcqAccuracy : 70; // fallback default if not tested
      const activeEssayWeight = totalEssays > 0 ? averageEssayScore : 65;
      const activeSrsWeight = totalFlashcards > 0 ? srsCompletionRate : 0;

      barReadiness = Math.round(
        (activeMcqWeight * 0.4) + (activeEssayWeight * 0.4) + (activeSrsWeight * 0.2)
      );
    } else {
      barReadiness = 0;
    }

    // Dynamic subject strength categorization
    // We categorize the responses by question subject
    const subjectStats: { [key: string]: { correct: number; total: number; scoreSum: number; essayCount: number } } = {};
    
    // We need to fetch details for questions to link responses to subjects
    // For simplicity, we can aggregate by grouping in Mongoose or looping
    // Let's populate the questionId references or query questions
    for (const resp of responses) {
      try {
        const questionInfo = await mongoose.model("Question").findById(resp.questionId);
        if (questionInfo) {
          const sub = questionInfo.subject;
          if (!subjectStats[sub]) {
            subjectStats[sub] = { correct: 0, total: 0, scoreSum: 0, essayCount: 0 };
          }
          if (resp.type === "MCQ") {
            subjectStats[sub].total += 1;
            if (resp.isCorrect) subjectStats[sub].correct += 1;
          } else {
            subjectStats[sub].scoreSum += resp.score || 0;
            subjectStats[sub].essayCount += 1;
          }
        }
      } catch {
        // Skip invalid references
      }
    }

    const subjectsArray = Object.keys(subjectStats).map(name => {
      const stats = subjectStats[name];
      const mcqRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
      const essayAvg = stats.essayCount > 0 ? Math.round(stats.scoreSum / stats.essayCount) : null;
      
      let masteryScore = 50; // base default
      if (mcqRate !== null && essayAvg !== null) {
        masteryScore = Math.round((mcqRate + essayAvg) / 2);
      } else if (mcqRate !== null) {
        masteryScore = mcqRate;
      } else if (essayAvg !== null) {
        masteryScore = essayAvg;
      }

      return {
        name,
        masteryScore,
        mcqCount: stats.total,
        essayCount: stats.essayCount,
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        barReadiness,
        streak: 3, // mock active streak
        totalMcqs,
        mcqAccuracy,
        totalEssays,
        averageEssayScore,
        totalFlashcards,
        dueFlashcards,
        boxDistribution,
        srsCompletionRate: Math.round(srsCompletionRate),
      },
      subjectMastery: subjectsArray,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Fetch analytics error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
