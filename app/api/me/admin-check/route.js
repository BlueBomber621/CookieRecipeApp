export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ isAdmin: false }, { status: 401 });

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const db = getFirestore();
    const snap = await db.collection("admins").doc(decoded.uid).get();
    return NextResponse.json({ isAdmin: snap.exists });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }
}
