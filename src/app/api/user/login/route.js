import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import connectDB from '@/utils/connectDB'
import User from '@/models/User'

export async function POST(req) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const user = await User.findOne({ email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userData = {
      id: user._id,
      email: user.email,
    }

    const res = NextResponse.json({
      status: 'success',
      message: 'Logged in successfully',
      user: userData,
      token
    })

    // Set HttpOnly cookie
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 401 })
  }
}
