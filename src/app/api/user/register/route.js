import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import User from '@/models/User';
import connectDB from '@/utils/connectDB';
import { encryptData, randomCode, randomNumber } from '@/utils/hooks';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const email = body.email?.trim();
    const password = body.password;

    // Validate email
    if (!email) throw new Error('Email is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new Error('Email already used');

    // Validate password
    if (!password) throw new Error('Password is required');
    if (password.length < 8) throw new Error('Minimum 8 characters password required');


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();


    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userData = {
      id: user._id,
    }

    const res = NextResponse.json({
      status: 'success',
      message: 'User created successfully',
      user: userData,
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
    console.error('Error:', error.message);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
