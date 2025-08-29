"use client";

import RecipeCard from "./recipeCard";

export default function RecipeList({ linkPref, recipes }) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          desc={recipe.desc}
          imageLink={recipe.imageurl}
          link={linkPref + recipe.id}
          validated={recipe.validated}
        />
      ))}
    </div>
  );
}
