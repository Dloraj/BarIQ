import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Codal from "@/models/Codal";
import Flashcard from "@/models/Flashcard";
import Question from "@/models/Question";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // 1. Seed Codal Provisions (Philippine Civil Code - Obligations & Contracts)
    await Codal.deleteMany({});
    const seededCodals = await Codal.insertMany([
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1156",
        content: "An obligation is a juridical necessity to give, to do or not to do.",
        keywords: ["obligation", "definition", "necessity"],
        notes: "Juridical necessity means that in case of non-compliance, the courts of justice may be called upon to enforce its fulfillment or, in default thereof, the economic value that it represents.",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1157",
        content: "Obligations arise from: (1) Law; (2) Contracts; (3) Quasi-contracts; (4) Acts or omissions punished by law; and (5) Quasi-delicts.",
        keywords: ["sources", "arise", "law", "contracts", "quasi-contracts", "delicts", "quasi-delicts"],
        notes: "This list is exclusive. No obligation exists unless it has source from one of these five.",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1158",
        content: "Obligations derived from law are not presumed. Only those expressly determined in this Code or in special laws are demandable, and shall be regulated by the precepts of the law which establishes them; and as to what has not been foreseen, by the provisions of this Book.",
        keywords: ["law", "presumed", "expressly", "regulated"],
        notes: "Legal obligations are strict. Example: Payment of taxes, support between spouses.",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1159",
        content: "Obligations arising from contracts have the force of law between the contracting parties and should be complied with in good faith.",
        keywords: ["contracts", "force of law", "good faith"],
        notes: "Autonomy of contracts. Parties can establish stipulations as long as they are not contrary to law, morals, good customs, public order, or public policy.",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1160",
        content: "Obligations derived from quasi-contracts shall be subject to the provisions of Chapter 1, Title XVII, of this Book.",
        keywords: ["quasi-contracts", "unjust enrichment", "negotiorum gestio", "solutio indebiti"],
        notes: "Based on the principle that no one shall be unjustly enriched or benefited at the expense of another. Key examples: Negotiorum Gestio and Solutio Indebiti.",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1161",
        content: "Civil obligations arising from criminal offenses shall be governed by the penal laws, subject to the provisions of Article 2177, and of the pertinent provisions of Chapter 2, Preliminary Title, on Human Relations, and of Title XVIII of this Book, regulating damages.",
        keywords: ["criminal", "delict", "civil liability", "restitution", "reparation", "indemnification"],
        notes: "Every person criminally liable for a felony is also civilly liable. (Article 100, Revised Penal Code).",
      },
      {
        subject: "Civil Law",
        book: "Book IV: Obligations and Contracts",
        title: "Title I: Obligations",
        chapter: "Chapter 1: General Provisions",
        articleNumber: "1162",
        content: "Obligations derived from quasi-delicts shall be governed by the provisions of Chapter 2, Title XVII of this Book, and by special laws.",
        keywords: ["quasi-delict", "tort", "fault", "negligence"],
        notes: "An act or omission causing damage to another, there being fault or negligence, but no pre-existing contractual relation (Article 2176, Civil Code).",
      },
    ]);

    // 2. Seed Mock Questions (MCQs and Essays)
    await Question.deleteMany({});
    const seededQuestions = await Question.insertMany([
      {
        subject: "Civil Law",
        topic: "General Provisions on Obligations",
        type: "MCQ",
        scenario: "Juan and Pedro entered into a contract where Juan promised to deliver a specific horse to Pedro. Before delivery, the horse died of natural causes without any fault on Juan's part. What is the status of Juan's obligation?",
        options: [
          { text: "Juan is still obliged to deliver a horse of equal value.", isCorrect: false },
          { text: "Juan's obligation is extinguished because the object is specific and was lost without his fault.", isCorrect: true },
          { text: "Pedro can demand damages for breach of contract.", isCorrect: false },
          { text: "Juan is in delay and must pay interest.", isCorrect: false },
        ],
        correctExplanation: "Under Philippine Civil Law, the obligation to deliver a specific thing is extinguished if it is lost or destroyed without the fault of the debtor, and before he has incurred in delay.",
        legalBasis: "Article 1262 of the Civil Code of the Philippines.",
      },
      {
        subject: "Civil Law",
        topic: "Quasi-contracts",
        type: "MCQ",
        scenario: "By mistake, Maria deposited Php 10,000 into the bank account of Jose. Jose spent the money, thinking it was a gift. Jose is legally obligated to return the money under what principle?",
        options: [
          { text: "Negotiorum Gestio", isCorrect: false },
          { text: "Solutio Indebiti", isCorrect: true },
          { text: "Quasi-delict", isCorrect: false },
          { text: "Criminal Liability", isCorrect: false },
        ],
        correctExplanation: "Solutio Indebiti is a quasi-contractual relation that arises when something is received when there is no right to demand it, and it was unduly delivered through mistake. The recipient has the duty to return it.",
        legalBasis: "Article 2154 of the Civil Code of the Philippines.",
      },
      {
        subject: "Criminal Law",
        topic: "Justifying Circumstances",
        type: "MCQ",
        scenario: "A, a storekeeper, was cornered by B, who was wielding a large bolo and shouting threats to kill A. Having no way to escape, A grabbed a licensed pistol underneath the counter and shot B in the chest, killing him. What defense can A claim?",
        options: [
          { text: "Justifying circumstance of self-defense", isCorrect: true },
          { text: "Mitigating circumstance of passion and obfuscation", isCorrect: false },
          { text: "Exempting circumstance of accident", isCorrect: false },
          { text: "Absolutory cause of defense of property", isCorrect: false },
        ],
        correctExplanation: "To successfully invoke self-defense, three elements must concur: (1) unlawful aggression on the part of the victim, (2) reasonable necessity of the means employed to prevent or repel it, and (3) lack of sufficient provocation on the part of the person defending himself. B pointing a bolo with threats is unlawful aggression, and A had no escape, making the shot reasonable.",
        legalBasis: "Article 11, paragraph 1 of the Revised Penal Code of the Philippines.",
      },
      {
        subject: "Civil Law",
        topic: "Obligations and Contracts",
        type: "Essay",
        scenario: "Arthur and Betty entered into an agreement where Arthur promised to construct a two-story residential house for Betty for Php 5,000,000. It was stipulated that the construction should be completed within 6 months. Arthur failed to finish the house on time due to a strike of cement truck drivers, which delayed the delivery of materials. Betty sued Arthur for damages for the delay. Arthur claims force majeure (fortuitous event) as a defense. Decide.",
        suggestedAnswer: "I would rule in favor of Betty and deny Arthur's defense of fortuitous event.\n\nUnder Article 1174 of the Civil Code, except in cases expressly specified by the law, or when it is otherwise declared by stipulation, or when the nature of the obligation requires the assumption of risk, no person shall be responsible for those events which could not be foreseen, or which, though foreseen, were inevitable.\n\nTo exempt a debtor from liability due to a fortuitous event, the event must be independent of the debtor's will, must render it impossible to fulfill the obligation in a normal manner, and the debtor must be free from any participation or negligence in the aggravation of the injury. A strike of cement truck drivers is a difficulty that could be foreseen and overcome by sourcing materials from other suppliers. It did not make construction absolutely impossible, but merely more difficult or expensive.\n\nTherefore, Arthur is liable for damages arising from delay as the strike does not constitute a valid fortuitous event to excuse non-performance.",
      },
    ]);

    // 3. Seed some default Flashcards for a dummy user (or we will load them dynamically for the current user)
    // Find or create test user to seed flashcards to
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = new User({
        fullName: "Test User",
        email: "test@example.com",
        password: "Password123!",
        role: "admin",
        isApproved: true,
      });
      await testUser.save();
    } else {
      testUser.isApproved = true;
      testUser.password = "Password123!";
      await testUser.save();
    }

    let seededFlashcardCount = 0;

    if (testUser) {
      await Flashcard.deleteMany({ userId: testUser._id });
      const cards = await Flashcard.insertMany([
        {
          userId: testUser._id,
          subject: "Civil Law",
          front: "Define 'Obligation' under Article 1156 of the Civil Code.",
          back: "An obligation is a juridical necessity to give, to do or not to do.",
          sourceArticle: "Article 1156, Civil Code",
          box: 1,
          nextReviewDate: new Date(),
        },
        {
          userId: testUser._id,
          subject: "Civil Law",
          front: "Name the five sources of obligations.",
          back: "1. Law\n2. Contracts\n3. Quasi-contracts\n4. Acts or omissions punished by law (Delicts)\n5. Quasi-delicts (Torts)",
          sourceArticle: "Article 1157, Civil Code",
          box: 1,
          nextReviewDate: new Date(),
        },
        {
          userId: testUser._id,
          subject: "Civil Law",
          front: "What is a 'Quasi-delict'?",
          back: "It is an act or omission that causes damage to another, there being fault or negligence, but no pre-existing contractual relation between the parties.",
          sourceArticle: "Article 2176, Civil Code",
          box: 1,
          nextReviewDate: new Date(),
        },
        {
          userId: testUser._id,
          subject: "Criminal Law",
          front: "What is a felony?",
          back: "Acts and omissions punishable by law are felonies (delitos) when committed not only by means of deceit (dolo) but also by means of fault (culpa).",
          sourceArticle: "Article 3, Revised Penal Code",
          box: 1,
          nextReviewDate: new Date(),
        },
      ]);
      seededFlashcardCount = cards.length;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      codalsCount: seededCodals.length,
      questionsCount: seededQuestions.length,
      flashcardsCount: seededFlashcardCount,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Seeding error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
