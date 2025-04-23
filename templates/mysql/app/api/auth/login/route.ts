import db from "@/db";
import { users } from "@/db/schema";
import { createJWT } from "@/lib/auth";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.AUTH_TOKEN_NAME) {
      throw new Error(
        "AUTH_TOKEN_NAME is not defined in the environment variables"
      );
    }
    const { email, password } = await req.json();
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: "Missing credentials" }),
        { status: 400 }
      );
    }
    const cookieStore = await cookies();
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existing) {
      return new NextResponse(
        JSON.stringify({ error: "User doesn't exists" }),
        { status: 400 }
      );
    }

    const hash = crypto
      .createHash("sha256")
      .update(password + existing.passwordSalt)
      .digest("hex");

    if (hash !== existing.passwordHash) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    const token = createJWT({ id: existing.id, email });

    cookieStore.set(process.env.AUTH_TOKEN_NAME!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 28, // 28 days
      sameSite: "strict",
    });

    const response = new NextResponse(
      JSON.stringify({ message: "Login successful" }),
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
