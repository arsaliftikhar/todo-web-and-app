import { NextResponse } from "next/server"

export async function POST() {
  // Create a response and clear the HttpOnly cookie
  const response = NextResponse.json(
    {
      status: "success",
      message: "Logged out successfully",
    },
    { status: 200 }
  )

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // Immediately expire
  })

  return response
}
