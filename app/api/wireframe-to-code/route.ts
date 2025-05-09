import { db } from "@/configs/db";
import { Wire2WebTable } from "@/configs/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { description, imageUrl, model, uid, email } = await req.json();
  console.log(uid);

  // Insert directly without credit checks
  const result = await db
    .insert(Wire2WebTable)
    .values({
      uid: uid.toString(),
      description: description,
      imageUrl: imageUrl,
      model: model,
      createdBy: email || "guest@example.com",
    })
    .returning({ id: Wire2WebTable.id });

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const reqUrl = req.url;
  const { searchParams } = new URL(reqUrl);
  const uid = searchParams?.get("uid");
  const email = searchParams?.get("email");

  if (uid) {
    const result = await db
      .select()
      .from(Wire2WebTable)
      .where(eq(Wire2WebTable.uid, uid));
    return NextResponse.json(result[0]);
  } else if (email) {
    const result = await db
      .select()
      .from(Wire2WebTable)
      .where(eq(Wire2WebTable.createdBy, email))
      .orderBy(desc(Wire2WebTable.id));
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "No Record Found" });
}

export async function PUT(req: NextRequest) {
  const { uid, codeResp } = await req.json();

  const result = await db
    .update(Wire2WebTable)
    .set({
      code: codeResp,
    })
    .where(eq(Wire2WebTable.uid, uid))
    .returning({ uid: Wire2WebTable.uid });

  return NextResponse.json(result);
}
