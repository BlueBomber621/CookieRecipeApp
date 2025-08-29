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
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function GET(req) {
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

    const isOwner = id == decoded.uid;
    const isAdmin = (await db.collection("admins").doc(decoded.uid).get())
      .exists;

    let querySnapshot;
    if (isOwner || isAdmin) {
      const q = db.collection("recipes").where("ownerId", "==", id).limit(4);
      querySnapshot = await q.get();
    } else {
      const q = db
        .collection("recipes")
        .where("ownerId", "==", id)
        .where("validated", "==", true)
        .limit(4);
      querySnapshot = await q.get();
    }

    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const nextCursor =
      querySnapshot.size === 4 ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json(
      { items, nextCursor },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
