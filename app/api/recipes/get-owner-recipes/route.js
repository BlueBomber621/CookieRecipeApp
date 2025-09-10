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

function ForceCountInt(num) {
  const newNum = Math.trunc(Math.max(parseInt(num), 1));
  return newNum;
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
    const page = Math.trunc(url.searchParams.get("page"));

    const isOwner = id == decoded.uid;
    const isAdmin = (await db.collection("admins").doc(decoded.uid).get())
      .exists;

    let querySnapshot;
    let pages;
    if (isOwner || isAdmin) {
      pages = Math.ceil(
        (await db.collection("recipes").where("ownerId", "==", id).get()).size /
          4
      );
      if (page > pages) {
        const q = db
          .collection("recipes")
          .where("ownerId", "==", id)
          .offset((Math.max(pages, 1) - 1) * 4)
          .limit(4);
        querySnapshot = await q.get();
      } else {
        const q = db
          .collection("recipes")
          .where("ownerId", "==", id)
          .offset((ForceCountInt(page) - 1) * 4)
          .limit(4);
        querySnapshot = await q.get();
      }
    } else {
      pages = Math.ceil(
        (
          await db
            .collection("recipes")
            .where("ownerId", "==", id)
            .where("validated", "==", true)
            .get()
        ).size / 4
      );
      if (page > pages) {
        const q = db
          .collection("recipes")
          .where("ownerId", "==", id)
          .where("validated", "==", true)
          .offset((pages - 1) * 4)
          .limit(4);
        querySnapshot = await q.get();
      } else {
        const q = db
          .collection("recipes")
          .where("ownerId", "==", id)
          .where("validated", "==", true)
          .offset((ForceCountInt(page) - 1) * 4)
          .limit(4);
        querySnapshot = await q.get();
      }
    }

    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const nextCursor =
      querySnapshot.size === 4
        ? querySnapshot.docs[querySnapshot.docs.length - 1].id
        : null;

    return NextResponse.json(
      { items, nextCursor, pages },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
