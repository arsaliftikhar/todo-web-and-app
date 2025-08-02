import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/connectDB";
import { cookies } from "next/headers";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function POST(req) {
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



        const body = await req.json();
        const amount = body.amount;
        const transactionType = body.transaction_type;
        const description = body.description;

        // Validate amount
        if (!amount || isNaN(amount) || Number(amount) <= 0) throw new Error('Enter valid amount');

        // Validate type
        if (!transactionType || transactionType != 'income' && transactionType != 'expense') throw new Error('Enter valid Transaciton type should be income or expense');

        //validate description
        if (!description || typeof description !== 'string' || !description.trim()) {
            throw new Error('Enter valid description');
        }


        const transaction = new Transaction({
            user_id : user._id,
            amount,
            transaction_type:transactionType,
            description
        })

        await transaction.save();

        return NextResponse.json({ status: "success",message:"Transaction created successfully", data: transaction }, { status: 200 });

    } catch (error) {
        console.error("User fetch error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
