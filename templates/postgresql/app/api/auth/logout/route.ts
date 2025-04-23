import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.AUTH_TOKEN_NAME) {
      throw new Error(
        "AUTH_TOKEN_NAME is not defined in the environment variables"
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.AUTH_TOKEN_NAME!);
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Not logged in" }), {
        status: 401,
      });
    }

    cookieStore.set(process.env.AUTH_TOKEN_NAME!, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // 0 to delete the cookie immediately
      sameSite: "strict",
    });

    return new NextResponse(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Logout:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
