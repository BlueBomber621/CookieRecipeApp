"use client";

import { authContext } from "@/lib/store/auth-context";
import { getIdToken } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import RecipeList from "../components/recipeList";

export default function AdminGate() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState([]);
  const { user, loading } = useContext(authContext);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);

  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    async function run() {
      if (loading) return;
      if (!user) {
        if (!canceled) setStatus("no");
        return;
      }

      try {
        const token = await getIdToken(user, true);

        const adminResponse = await fetch("/api/me/admin-check", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: ctrl.signal,
        });
        const adminJson = await adminResponse.json();

        if (!adminResponse.ok || !adminJson.isAdmin) {
          if (!canceled) setStatus("no");
          return;
        }
        if (!canceled) setStatus("yes");

        const listResponse = await fetch(
          `/api/recipes/waiting-recipes?page=${encodeURIComponent(page)}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: ctrl.signal,
          }
        );

        const listJson = await listResponse.json();

        if (!listResponse.ok) {
          console.error(
            "waiting-recipes error:",
            listResponse.status,
            listJson
          );
          return;
        }

        if (!canceled) {
          setData(listJson.items ?? listJson);
          setMaxPages(listJson.pages ?? listJson);
          if (page > listJson.pages ?? listJson) {
            setPage(listJson.pages ?? listJson);
          }
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("admin fetch error:", error);
        if (!canceled) setStatus("no");
      }
    }

    run();
    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [user, loading, page]);

  if (loading || status === "loading") {
    return (
      <div className="p-10">
        <div className="w-full min-h-[320px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  if (status === "no") {
    return (
      <div className="flex flex-col p-10">
        <h1 className="text-lg md:text-xl font-bold ml-5">Not Authorized</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-10">
      <h1 className="text-lg md:text-xl font-bold ml-5">Admin Controls</h1>
      <RecipeList linkPref={"/admin/recipe/"} recipes={data} />
      {data && maxPages > 1 ? (
        <div className="flex justify-center items-center gap-2 w-auto mt-[-1rem] md:mt-[-2rem] py-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span>
            {page} / {maxPages}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= maxPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
