import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAIFeedback {
  legalKnowledgeScore: number;
  applicationScore: number;
  logicPresentationScore: number;
  detailedCritique: string;
  suggestedImprovements: string;
}

export interface IExamResponse extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  type: "MCQ" | "Essay";
  userAnswer: string; // Chosen MCQ option text or Essay text response
  isCorrect?: boolean; // For MCQ
  score?: number; // Overall grade for essay (0-100)
  aiFeedback?: IAIFeedback; // Full analysis evaluation
  timeSpentSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIFeedbackSchema = new Schema<IAIFeedback>({
  legalKnowledgeScore: { type: Number, required: true, min: 0, max: 100 },
  applicationScore: { type: Number, required: true, min: 0, max: 100 },
  logicPresentationScore: { type: Number, required: true, min: 0, max: 100 },
  detailedCritique: { type: String, required: true, trim: true },
  suggestedImprovements: { type: String, required: true, trim: true },
});

const ExamResponseSchema = new Schema<IExamResponse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required"],
    },
    type: {
      type: String,
      enum: ["MCQ", "Essay"],
      required: [true, "Type is required"],
    },
    userAnswer: {
      type: String,
      required: [true, "Answer content is required"],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiFeedback: {
      type: AIFeedbackSchema,
      default: undefined,
    },
    timeSpentSeconds: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index to track responses per user
ExamResponseSchema.index({ userId: 1, createdAt: -1 });

const ExamResponse: Model<IExamResponse> =
  mongoose.models.ExamResponse ||
  mongoose.model<IExamResponse>("ExamResponse", ExamResponseSchema);

export default ExamResponse;
