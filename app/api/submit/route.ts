import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import ExamResponse from "@/models/ExamResponse";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, questionId, userAnswer, timeSpentSeconds } = body;

    if (!userId || !questionId || userAnswer === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    // 1. Handlers for Multiple Choice Questions (MCQ)
    if (question.type === "MCQ") {
      const correctOption = question.options?.find(opt => opt.isCorrect);
      const isCorrect = correctOption?.text === userAnswer;

      const response = await ExamResponse.create({
        userId: new mongoose.Types.ObjectId(userId),
        questionId: new mongoose.Types.ObjectId(questionId),
        type: "MCQ",
        userAnswer,
        isCorrect,
        timeSpentSeconds,
      });

      return NextResponse.json({
        success: true,
        type: "MCQ",
        isCorrect,
        correctAnswer: correctOption?.text,
        explanation: question.correctExplanation,
        legalBasis: question.legalBasis,
        response,
      });
    }

    // 2. Handlers for Essay Questions (Philippine Bar ALAC Assessment Simulator)
    if (question.type === "Essay") {
      // Analyze user answer to calculate simulated scores
      const textLower = userAnswer.toLowerCase();
      
      // Look for key terms related to civil/contract law fortuitous events (the Arthur vs Betty scenario)
      const hasArticleRef = textLower.includes("1174") || textLower.includes("article");
      const hasFortuitous = textLower.includes("fortuitous") || textLower.includes("force majeure");
      const hasStrikeRef = textLower.includes("strike") || textLower.includes("supplier") || textLower.includes("truck");
      const hasLiability = textLower.includes("liable") || textLower.includes("liability") || textLower.includes("ruling") || textLower.includes("favor of");

      // Score computations based on heuristic metrics
      let legalKnowledgeScore = 50; // base score
      if (hasArticleRef) legalKnowledgeScore += 20;
      if (hasFortuitous) legalKnowledgeScore += 15;
      if (textLower.length > 250) legalKnowledgeScore += 10;
      legalKnowledgeScore = Math.min(100, legalKnowledgeScore);

      let applicationScore = 50;
      if (hasStrikeRef) applicationScore += 25;
      if (textLower.length > 350) applicationScore += 15;
      if (hasLiability) applicationScore += 10;
      applicationScore = Math.min(100, applicationScore);

      // Presentation score measures ALAC adherence (paragraphs, transitional phrases)
      let logicPresentationScore = 55;
      const paragraphCount = userAnswer.split(/\n+/).filter((p: string) => p.trim().length > 0).length;
      if (paragraphCount >= 3) logicPresentationScore += 20; // Good separation (ALAC components)
      if (textLower.includes("therefore") || textLower.includes("consequently") || textLower.includes("accordingly")) {
        logicPresentationScore += 15;
      }
      logicPresentationScore = Math.min(100, logicPresentationScore);

      const overallScore = Math.round(
        (legalKnowledgeScore * 0.4) + (applicationScore * 0.35) + (logicPresentationScore * 0.25)
      );

      // Generate customized critique based on the user's input
      let detailedCritique = "";
      let suggestedImprovements = "";

      if (overallScore >= 85) {
        detailedCritique = "Excellent attempt! You successfully structured your legal arguments around the ALAC format. Your analysis of the fortuitous event defense is legally sound and correctly applies the requirements under Article 1174 of the Civil Code.";
        suggestedImprovements = "To achieve a perfect score, try to elaborate more on the distinction between ordinary difficulty/expense vs. absolute physical impossibility of the performance.";
      } else if (overallScore >= 70) {
        detailedCritique = "Good attempt. You identified the central issue regarding fortuitous events (Article 1174) and arrived at the correct conclusion. However, your application of the facts could be slightly more rigorous.";
        suggestedImprovements = "1. Explicitly list the three to four elements of a fortuitous event to demonstrate complete mastery of the legal basis.\n2. Dedicate a separate paragraph to apply those elements step-by-step to the trucks strike.";
      } else {
        detailedCritique = "Your answer needs structured improvement. While you attempted to answer the problem, your legal basis was weak or unspecified. You need to structure your response following the ALAC format: Answer, Legal Basis, Application, Conclusion.";
        suggestedImprovements = "1. Start with a direct 'Yes' or 'No' answer in your first sentence.\n2. Cite Article 1174 of the Civil Code and specify that strikes are generally foreseeable and do not excuse liability.\n3. Separate your writing into distinct paragraphs.";
      }

      const response = await ExamResponse.create({
        userId: new mongoose.Types.ObjectId(userId),
        questionId: new mongoose.Types.ObjectId(questionId),
        type: "Essay",
        userAnswer,
        score: overallScore,
        aiFeedback: {
          legalKnowledgeScore,
          applicationScore,
          logicPresentationScore,
          detailedCritique,
          suggestedImprovements,
        },
        timeSpentSeconds,
      });

      return NextResponse.json({
        success: true,
        type: "Essay",
        score: overallScore,
        suggestedAnswer: question.suggestedAnswer,
        response,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid question type" }, { status: 400 });
  } catch (error) {
    const err = error as Error;
    console.error("Submission grading error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process grading" },
      { status: 500 }
    );
  }
}
