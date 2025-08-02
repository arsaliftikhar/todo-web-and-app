import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/connectDB";
import { cookies } from "next/headers";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function PATCH(req, context) {
  try {
    await connectDB();

    const { transactionId } = context.params; // ✅ Don't destructure in the function args
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ status: "error", message: "No token provided" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ status: "error", message: "Invalid or expired token" }, { status: 401 });
    }

    const user = await User.findById(decoded.id).lean().select("_id");

    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }

    if (!transactionId) {
      return NextResponse.json({ status: "error", message: "Invalid transaction ID" }, { status: 400 });
    }

    const body = await req.json();
    const { amount, transaction_type, description } = body;

    // Validate inputs
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ status: "error", message: "Invalid amount" }, { status: 400 });
    }

    if (!["income", "expense"].includes(transaction_type)) {
      return NextResponse.json({ status: "error", message: "Type must be 'income' or 'expense'" }, { status: 400 });
    }

    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return NextResponse.json({ status: "error", message: "Enter valid description" }, { status: 400 });
    }

    // Update transaction
    const updated = await Transaction.findOneAndUpdate(
      { _id: transactionId, user_id: user._id },
      { $set: { amount, transaction_type, description } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ status: "error", message: "Transaction not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      message: "Transaction updated successfully",
      data: updated,
    }, { status: 200 });

  } catch (error) {
    console.error("Transaction update error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
