import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFlashcard extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  front: string;
  back: string;
  sourceArticle?: string;
  box: number; // Leitner Box (1 to 5)
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    front: {
      type: String,
      required: [true, "Front text is required"],
      trim: true,
    },
    back: {
      type: String,
      required: [true, "Back text is required"],
      trim: true,
    },
    sourceArticle: {
      type: String,
      trim: true,
    },
    box: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance fetching based on review deadlines
FlashcardSchema.index({ userId: 1, nextReviewDate: 1 });

const Flashcard: Model<IFlashcard> =
  mongoose.models.Flashcard || mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);

export default Flashcard;
