"use client";

import { authContext } from "@/lib/store/auth-context";
import { getIdToken } from "firebase/auth";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import RecipeList from "../components/recipeList";

export default function UserPage() {
  const { user, loading, Logout } = useContext(authContext);
  const [data, setData] = useState({ owned: [], fav: [] });
  const [maxPages, setMaxPages] = useState({ owned: 1, fav: 1 });
  const [page, setPage] = useState({ owned: 1, fav: 1 });
  const [pageLoading, setPageLoading] = useState({ owned: true, fav: true });

  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    async function run() {
      if (loading || !user) return;
      try {
        setPageLoading((prev) => ({ ...prev, owned: true }));
        const token = await getIdToken(user, true);

        const listResponse = await fetch(
          `/api/recipes/get-owner-recipes?id=${user.uid}&page=${page.owned}`,
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
          setData((prev) => ({ ...prev, owned: listJson.items ?? listJson }));
          setMaxPages((prev) => ({ ...prev, owned: listJson.pages ?? 1 }));
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("recipe fetch error:", error);
        if (!canceled) setData((prev) => ({ ...prev, owned: [] }));
      } finally {
        if (!canceled) setPageLoading((prev) => ({ ...prev, owned: false }));
      }
    }

    run();
    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [user, loading, page.owned]);

  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    async function run() {
      if (loading || !user) return;
      try {
        setPageLoading((prev) => ({ ...prev, fav: true }));
        const token = await getIdToken(user, true);

        const listResponse = await fetch(
          `/api/recipes/get-favorited-recipes?page=${page.fav}`,
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
            "get-favorited-recipes error:",
            listResponse.status,
            listJson
          );
          return;
        }

        if (!canceled) {
          setData((prev) => ({ ...prev, fav: listJson.items ?? listJson }));
          setMaxPages((prev) => ({ ...prev, fav: listJson.pages ?? 1 }));
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("recipe fetch error:", error);
        if (!canceled) setData((prev) => ({ ...prev, fav: [] }));
      } finally {
        setPageLoading((prev) => ({ ...prev, fav: false }));
      }
    }

    run();
    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [user, loading, page.fav]);

  if (!user && !loading) return redirect("/");

  if (loading) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[380px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  function GetJoinDate() {
    const dateString = user.metadata.creationTime.split(" ").slice(1, 4);
    return `${dateString[1]} ${dateString[0]}, ${dateString[2]}`;
  }

  return (
    <div className="flex flex-col p-10">
      <div className="flex flex-col md:flex-row justify-around items-center md:items-start px-10 py-5 rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900">
        <div className="flex flex-row gap-2">
          <div className="border-2 border-white rounded-full w-[48px] h-[48px] bg-black">
            <img
              src={user.photoURL || "/Cookie.png"}
              alt={user.displayName}
              className="w-full h-full object-cover object-center rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-lg md:text-xl font-bold">{user.displayName}</h1>
            <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
              Joined On {GetJoinDate()}
            </p>
          </div>

          <button className="btn btn-danger p-1 px-4 text-md" onClick={Logout}>
            Logout
          </button>
        </div>
      </div>
      <h1 className="text-lg md:text-xl font-bold ml-5 mt-10">Your Recipes</h1>
      {pageLoading.owned ? (
        <div className="w-full min-h-[380px] my-[1rem] md:my-[2rem] rounded-md bg-neutral-200/80 animate-pulse shadow-sm" />
      ) : null}
      {data.owned.length > 0 && !pageLoading.owned ? (
        <RecipeList linkPref={"/recipe/"} recipes={data.owned} />
      ) : null}
      {data.owned.length == 0 && !pageLoading.owned ? (
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
            No recipes available for this user!
          </p>
        </div>
      ) : null}
      {page.owned < maxPages.owned || page.owned > 1 ? (
        <div className="flex justify-center items-center gap-2 w-auto mt-[-1rem] md:mt-[-2rem] py-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              setPage((prev) => ({ ...prev, owned: prev.owned - 1 }))
            }
            disabled={page.owned <= 1}
          >
            Prev
          </button>
          <span>
            {page.owned} / {maxPages.owned}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              setPage((prev) => ({ ...prev, owned: prev.owned + 1 }))
            }
            disabled={page.owned >= maxPages.owned}
          >
            Next
          </button>
        </div>
      ) : null}
      <h1 className="text-lg md:text-xl font-bold ml-5 mt-10">
        Your Favorites
      </h1>
      {pageLoading.fav ? (
        <div className="w-full min-h-[380px] my-[1rem] md:my-[2rem] rounded-md bg-neutral-200/80 animate-pulse shadow-sm" />
      ) : null}
      {data.fav.length > 0 && !pageLoading.fav ? (
        <RecipeList linkPref={"/recipe/"} recipes={data.fav} />
      ) : null}
      {data.fav.length == 0 && !pageLoading.fav ? (
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
            No favorited recipes found!
          </p>
        </div>
      ) : null}
      {page.fav < maxPages.fav || page.fav > 1 ? (
        <div className="flex justify-center items-center gap-2 w-auto mt-[-1rem] md:mt-[-2rem] py-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage((prev) => ({ ...prev, fav: prev.fav - 1 }))}
            disabled={page.fav <= 1}
          >
            Prev
          </button>
          <span>
            {page.fav} / {maxPages.fav}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage((prev) => ({ ...prev, fav: prev.fav + 1 }))}
            disabled={page.fav >= maxPages.fav}
          >
            Next
          </button>
        </div>
      ) : null}
      <div className="flex justify-center items-center mt-6">
        <span className="text-md mr-2">Want to create a new recipe?</span>
        <a
          href="/create"
          className="btn btn-primary px-4 py-2 rounded-md text-white bg-pastelyellow-700 hover:bg-pastelyellow-800 transition"
        >
          Create Recipe
        </a>
      </div>
    </div>
  );
}
