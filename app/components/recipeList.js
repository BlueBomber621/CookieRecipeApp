"use client";

import { useContext } from "react";
import RecipeCard from "./recipeCard";
import { authContext } from "@/lib/store/auth-context";

export default function RecipeList({ linkPref, recipes }) {
  const { user, loading } = useContext(authContext);

  function GetAverageRatings(ratings) {
    let total = 0;
    for (const key in ratings) {
      total += parseInt(ratings[key]);
    }
    return total / Object.keys(ratings).length;
  }

  if (loading) {
    return (
      <div className="w-full min-h-[380px] my-[1rem] md:my-[2rem] rounded-md bg-neutral-200/80 animate-pulse shadow-sm" />
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
      {recipes.map((recipe) => {
        return (
          <RecipeCard
            key={recipe.id}
            title={recipe.title}
            desc={recipe.desc}
            imageLink={recipe.imageurl}
            link={linkPref + recipe.id}
            validated={recipe.validated}
            favorited={
              Array.isArray(recipe.favorites) &&
              recipe.favorites?.includes(user?.uid)
            }
            categories={
              Array.isArray(recipe.categories)
                ? recipe.categories.map((c) => String(c))
                : []
            }
            ratings={
              typeof recipe.ratings == "object"
                ? GetAverageRatings(recipe.ratings)
                : 0
            }
          />
        );
      })}
    </div>
  );
}
