import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/connectDB";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { headers } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const headerList = headers();
    const authHeader = headerList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { status: "error", message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

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
      .select("-password -__v");

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const transactions = await Transaction.find({ user_id: user._id }).sort({
      createdAt: -1,
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.transaction_type === "income") totalIncome += t.amount;
      if (t.transaction_type === "expense") totalExpense += t.amount;
    });

    const currentBalance = totalIncome - totalExpense;

    const userFinalResult = {
      ...user,
      current_balance: currentBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      currentDate: new Date().toISOString(),
      transactions,
    };

    return NextResponse.json(
      { status: "success", user: userFinalResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mobile user fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
