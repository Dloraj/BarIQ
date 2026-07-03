import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICodal extends Document {
  subject: string; // e.g., "Civil Law"
  book?: string;    // e.g., "Book IV: Obligations and Contracts"
  title?: string;   // e.g., "Title I: Obligations"
  chapter?: string;
  articleNumber: string; // e.g., "1156"
  content: string; // e.g., "An obligation is a juridical necessity..."
  keywords?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CodalSchema = new Schema<ICodal>(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    book: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    chapter: {
      type: String,
      trim: true,
    },
    articleNumber: {
      type: String,
      required: [true, "Article number is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    keywords: [{ type: String }],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per article number inside a subject
CodalSchema.index({ subject: 1, articleNumber: 1 }, { unique: true });

const Codal: Model<ICodal> =
  mongoose.models.Codal || mongoose.model<ICodal>("Codal", CodalSchema);

export default Codal;
