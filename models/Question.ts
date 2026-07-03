import mongoose, { Document, Model, Schema } from "mongoose";

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  subject: string; // e.g., "Civil Law"
  topic?: string;   // e.g., "Contracts"
  type: "MCQ" | "Essay";
  scenario: string; // The problem case text
  options?: IQuestionOption[]; // For MCQs
  correctExplanation?: string; // Explanation detail
  legalBasis?: string;         // Citing law source
  suggestedAnswer?: string;    // Sample essay response
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, required: true, default: false },
});

const QuestionSchema = new Schema<IQuestion>(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["MCQ", "Essay"],
      required: [true, "Question type is required"],
    },
    scenario: {
      type: String,
      required: [true, "Scenario text is required"],
      trim: true,
    },
    options: {
      type: [QuestionOptionSchema],
      default: undefined, // Only initialize for MCQ
    },
    correctExplanation: {
      type: String,
      trim: true,
    },
    legalBasis: {
      type: String,
      trim: true,
    },
    suggestedAnswer: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
