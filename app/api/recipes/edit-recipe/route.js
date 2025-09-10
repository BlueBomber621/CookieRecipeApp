export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    const db = getFirestore();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const docSnap = await db.collection("recipes").doc(id).get();
    if (!docSnap.exists)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    const isOwner = docSnap.data().ownerId == decoded.uid;
    if (!isOwner)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data = await req.json().catch(() => null);
    if (!data || Array.isArray(data) || typeof data !== "object") {
      return NextResponse.json(
        { error: "Body must be a JSON object" },
        { status: 400 }
      );
    }

    for (const key of Object.keys(data))
      if (data[key] === undefined) delete data[key];
    delete data.ownerId;
    delete data.validated;
    delete data.createdAt;
    delete data.updatedAt;

    await db
      .collection("recipes")
      .doc(id)
      .update({
        ...data,
        validated: false,
        favorites: [],
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
