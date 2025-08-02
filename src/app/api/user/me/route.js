import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/connectDB";
import { cookies } from "next/headers";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
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

    const user = await User.findById(decoded.id)
      .lean()
      .select('-password -__v');

    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }


    //fetch transactions of user
    const transactions = await Transaction.find({ user_id: user._id }).sort({ createdAt: -1 }); ;

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.transaction_type === "income") totalIncome += t.amount;
      if (t.transaction_type === "expense") totalExpense += t.amount;
    });

    const currentBalance = totalIncome - totalExpense;


    const currentDate = new Date();

    // ✅ Final user data
    const userFinalResult = {
      ...user,
      current_balance: currentBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      currentDate: currentDate.toISOString(),
      transactions
    };

    return NextResponse.json({ status: "success", user: userFinalResult }, { status: 200 });

  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
