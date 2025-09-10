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
    const rating = url.searchParams.get("value");

    const docRef = await db.collection("recipes").doc(id);
    const result = await db.runTransaction(async (tx) => {
      const docSnap = await tx.get(docRef);
      if (!docSnap.exists) throw new Error("NOT_FOUND");
      const docData = docSnap.data();
      if (docData.validated !== true) throw new Error("NOT_VALIDATED");

      const ratings =
        docData.ratings && typeof docData.ratings == "object"
          ? docData.ratings
          : {};
      const isRated = ratings.hasOwnProperty(decoded.uid);

      if (isRated)
        return { ok: true, rated: true, value: ratings[decoded.uid] };

      tx.update(docRef, { [`ratings.${decoded.uid}`]: rating });
      return { ok: true, rated: true, value: rating };
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}

export async function DELETE(req) {
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

    const docRef = await db.collection("recipes").doc(id);
    const result = await db.runTransaction(async (tx) => {
      const docSnap = await tx.get(docRef);
      if (!docSnap.exists) throw new Error("NOT_FOUND");
      const docData = docSnap.data();
      if (docData.validated !== true) throw new Error("NOT_VALIDATED");

      const ratings =
        docData.ratings && typeof docData.ratings == "object"
          ? docData.ratings
          : {};
      const isRated = ratings.hasOwnProperty(decoded.uid);

      if (!isRated) return { ok: true, favorited: false };

      tx.update(docRef, { [`ratings.${decoded.uid}`]: FieldValue.delete() });
      return { ok: true, favorited: false };
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
