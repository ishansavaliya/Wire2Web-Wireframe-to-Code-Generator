import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";

export async function POST(req: NextRequest) {
  const { userEmail, userName } = await req.json();
  console.log(userEmail);
  // try {
  const result = await db // Result of the SELECT query
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, userEmail));

  if (!result || result.length === 0) {
    // User does not exist, attempt to insert.
    const insertOpResult: any = await db // Renamed from 'result' to avoid confusion
      .insert(usersTable)
      .values({
        name: userName,
        email: userEmail,
        credits: 20,
        // @ts-ignore // This should ideally be resolved by ensuring values match the schema
      })
      .returning(); // Corrected: returning() without arguments to return all columns

    // Check if insertion was successful and returned the new user data
    if (insertOpResult && insertOpResult.length > 0) {
      return NextResponse.json(insertOpResult[0]);
    } else {
      // Log an error and return a server error response if insertion failed
      console.error(
        `Failed to create user or retrieve user data after insert for email: ${userEmail}`
      );
      return NextResponse.json(
        { error: "User creation failed." },
        { status: 500 }
      );
    }
  }
  // If 'result' is a non-empty array, the user exists.
  return NextResponse.json(result[0]);

  // } catch (e) {
  //     return NextResponse.json(e)
  // }
}

export async function GET(req: Request) {
  const reqUrl = req.url;
  const { searchParams } = new URL(reqUrl);
  const email = searchParams?.get("email");

  if (email) {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return NextResponse.json(result[0]);
  }
}
