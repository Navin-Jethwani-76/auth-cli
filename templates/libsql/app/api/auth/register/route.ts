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
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return new NextResponse(JSON.stringify({ error: "Invalid Request" }), {
        status: 400,
      });
    }
    const cookieStore = await cookies();
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing) {
      return new NextResponse(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const [user] = await db
      .insert(users)
      .values({ email, name, salt, hash })
      .returning({ id: users.id });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User creation failed" }),
        { status: 500 }
      );
    }

    const token = createJWT({ id: user.id, email });

    cookieStore.set(process.env.AUTH_TOKEN_NAME!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 28, // 28 days
      sameSite: "strict",
    });

    const response = new NextResponse(
      JSON.stringify({ message: "User created successfully" }),
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("Error during registration:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
