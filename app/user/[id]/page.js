"use client";

import { authContext } from "@/lib/store/auth-context";
import { getIdToken } from "firebase/auth";
import { redirect, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import RecipeList from "@/app/components/recipeList";

export default function UserPage({ params }) {
  const { id } = useParams();
  const { user, loading } = useContext(authContext);
  const [data, setData] = useState([]);
  const [maxPages, setMaxPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    async function run() {
      if (loading || !user) return;
      try {
        setPageLoading(true);
        const token = await getIdToken(user, true);

        const listResponse = await fetch(
          `/api/recipes/get-owner-recipes?id=${id}&page=${page}`,
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
            "get-owner-recipes error:",
            listResponse.status,
            listJson
          );
          return;
        }

        if (!canceled) {
          setData(listJson.items ?? listJson);
          setMaxPages(listJson.pages ?? 1);
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("recipe fetch error:", error);
        if (!canceled) setData([]);
      } finally {
        if (!canceled) setPageLoading(false);
      }
    }

    run();
    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [user, loading, page]);

  function GetJoinDate() {
    const dateString = user.metadata.creationTime.split(" ").slice(1, 4);
    return `${dateString[1]} ${dateString[0]}, ${dateString[2]}`;
  }

  if (!user && !loading) return redirect("/");

  if (loading) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[380px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-10">
      <h1 className="text-lg md:text-xl font-bold ml-5">Recipes</h1>
      {pageLoading ? (
        <div className="w-full min-h-[380px] my-[1rem] md:my-[2rem] rounded-md bg-neutral-200/80 animate-pulse shadow-sm" />
      ) : null}
      {data.length > 0 && !pageLoading ? (
        <RecipeList linkPref={"/recipe/"} recipes={data} />
      ) : null}
      {data.length == 0 && !pageLoading ? (
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
            No recipes available for this user!
          </p>
        </div>
      ) : null}
      {page < maxPages || page > 1 ? (
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
