import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

interface SignupRequestBody {
  fullName: string;
  email: string;
  password: string;
}

interface MongoError extends Error {
  code?: number;
  errors?: Record<string, { message: string }>;
}

interface ValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { fullName, email, password }: SignupRequestBody =
      await request.json();

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role: "admin",
      isApproved: false, // Requires super admin approval
    });

    await user.save();

    // Remove password from response
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please wait for admin approval.",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);

    const mongoError = error as MongoError;

    if (mongoError.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    if (mongoError.name === "ValidationError") {
      const validationError = mongoError as ValidationError;
      const messages = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

