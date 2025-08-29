"use client";

import RecipeDetails from "@/app/components/getRecipePage";
import { appContext } from "@/lib/store/app-context";
import { authContext } from "@/lib/store/auth-context";
import { getIdToken } from "firebase/auth";
import { redirect, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function AdminRecipePage() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState({});
  const { deleteRecipe } = useContext(appContext);
  const { user, loading } = useContext(authContext);

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

        const dataResponse = await fetch(
          `/api/recipes/admin-get-recipe?id=${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: ctrl.signal,
          }
        );
        const dataJson = await dataResponse.json();

        if (!dataResponse.ok) {
          console.error(
            "admin-get-recipe error:",
            dataResponse.status,
            dataJson
          );
          return;
        }

        if (!canceled) setData(dataJson.item ?? dataJson);
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
  }, [user, loading]);

  async function HandleValidation() {
    if (loading) return;
    if (!user) {
      if (!canceled) setStatus("no");
      return;
    }
    try {
      const token = await getIdToken(user, true);
      const res = await fetch(
        `/api/recipes/validate-recipes?id=${encodeURIComponent(
          id
        )}&validated=${encodeURIComponent(!data.validated)}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!res.ok) {
        console.error(`Failed to validate. Error code: ${res.status}`);
        return;
      }
    } catch (error) {
      console.error(`Failed to validate. Error: ${error}`);
    }
    redirect("/admin");
  }

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
      <RecipeDetails recipe={data} />
      <div className="flex flex-col md:flex-row justify-around align-center gap-5 border-2 border-foregroundshade p-5 m-5">
        <h2 className="flex-2 text-md md:text-lg font-bold">Admin Controls</h2>
        <div className="flex flex-col md:flex-row justify-end align-center flex-5 gap-5">
          {!data.validated ? (
            <button
              className="btn btn-primary px-4 py-2"
              onClick={HandleValidation}
            >
              Verify Recipe
            </button>
          ) : null}
          <button
            className="btn btn-secondary px-4 py-2"
            onClick={() => {
              redirect(`/admin/edit/${id}`);
            }}
          >
            Edit Recipe
          </button>
          <button
            className="btn btn-danger px-4 py-2"
            onClick={() => {
              deleteRecipe(id);
              redirect("/admin");
            }}
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
