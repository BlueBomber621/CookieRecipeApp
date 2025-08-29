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
  const [userData, setUserData] = useState({});

  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    async function run() {
      if (loading || !user) return;
      try {
        const token = await getIdToken(user, true);

        const listResponse = await fetch(
          `/api/recipes/get-owner-recipes?id=${id}`,
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

        if (!canceled) setData(listJson.items ?? listJson);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("recipe fetch error:", error);
        if (!canceled) setData([]);
      }
    }

    run();
    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [user, loading]);

  if (!user && !loading) return redirect("/");

  if (loading) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[320px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  function GetJoinDate() {
    const dateString = user.metadata.creationTime.split(" ").slice(1, 4);
    return `${dateString[1]} ${dateString[0]}, ${dateString[2]}`;
  }

  return (
    <div className="flex flex-col p-10">
      <h1 className="text-lg md:text-xl font-bold ml-5">Recipes</h1>
      {data.length > 0 ? (
        <RecipeList linkPref={"/recipe/"} recipes={data} />
      ) : (
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
            No recipes available for this user!
          </p>
        </div>
      )}
    </div>
  );
}
