import { verifyJWT } from "@/lib/auth";
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
    const data = verifyJWT(token.value);
    if (!data) {
      return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }
    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error in auth route:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
