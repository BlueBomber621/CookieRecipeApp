export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

export async function PUT(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const db = getFirestore();
    const isAdmin = (await db.collection("admins").doc(decoded.uid).get())
      .exists;
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const validated = url.searchParams.get("validated");
    if (!id)
      return NextResponse.json({ error: "Missing Recipe ID" }, { status: 400 });
    const docRef = await db.collection("recipes").doc(id);
    if (!(await docRef.get()).exists)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    await docRef.update({
      validated: validated === undefined ? true : !!validated,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
