import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/connectDB";
import { cookies } from "next/headers";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "No token provided" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { status: "error", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id)
      .lean()
      .select("_id");

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const transactionId = params.transactionId;

    if (!transactionId) {
      return NextResponse.json(
        { status: "error", message: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const deleted = await Transaction.findOneAndDelete({
      _id: transactionId,
      user_id: user._id,
    });

    if (!deleted) {
      return NextResponse.json(
        { status: "error", message: "Transaction not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction delete error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
