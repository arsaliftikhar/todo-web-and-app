import { NextResponse } from "next/server";

export async function GET() {
  try 
  {
    return NextResponse.json({ status: "success", message: "working" }, { status: 200 });
   
  } catch (error) {
    console.error("status:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
