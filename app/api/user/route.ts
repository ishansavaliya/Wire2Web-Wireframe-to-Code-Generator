import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";

export async function POST(req: NextRequest) {
  const { userEmail, userName } = await req.json();

  // Use a default guest email if none provided
  const email = userEmail || "guest@example.com";
  const name = userName || "Guest User";

  try {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!result || result.length === 0) {
      // User does not exist, create a new one
      const insertResult = await db
        .insert(usersTable)
        .values({
          name: name,
          email: email,
          credits: 99999, // Unlimited credits
        })
        .returning();

      if (insertResult && insertResult.length > 0) {
        return NextResponse.json(insertResult[0]);
      } else {
        return NextResponse.json(
          { error: "User creation failed." },
          { status: 500 }
        );
      }
    }

    // Return existing user
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error in user API:", error);
    return NextResponse.json(
      { error: "Server error processing user request." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const reqUrl = req.url;
  const { searchParams } = new URL(reqUrl);
  const email = searchParams?.get("email") || "guest@example.com";

  try {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (result && result.length > 0) {
      return NextResponse.json(result[0]);
    } else {
      // Create a default guest user if none exists
      const guestUser = {
        name: "Guest User",
        email: "guest@example.com",
        credits: 99999,
      };
      return NextResponse.json(guestUser);
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 }
    );
  }
}
