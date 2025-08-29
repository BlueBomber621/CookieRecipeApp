"use client";

import { appContext } from "@/lib/store/app-context";
import { authContext } from "@/lib/store/auth-context";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

export default function RecipeDetails({ recipe }) {
  if (!recipe) return;
  const { deleteRecipe } = useContext(appContext);
  const { user, loading } = useContext(authContext);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.uid == recipe.ownerId) setIsOwner(true);
  }, [user, loading]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-around items-center md:items-start px-10 py-5 rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900">
        <div className="flex-2">
          <div className="relative max-w-sm w-2xs md:w-lg aspect-[16/9] bg-black">
            <img
              src={recipe.imageurl || "/Cookie.png"}
              alt={recipe.title}
              className="absolute inset-0 w-full h-full object-contain object-center rounded"
            />
          </div>
        </div>
        <div className="flex-3 flex flex-col justify-start md:ml-5 mt-4 md:mt-0 w-full">
          <h1 className="text-lg md:text-xl font-bold text-center mb-3">
            {recipe.title}
          </h1>
          <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100 mb-4">
            {recipe.desc}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-neutral-700 dark:text-neutral-200">
            {recipe.servings ? (
              <div>
                <strong>Servings:</strong> {recipe.servings}
              </div>
            ) : null}
            {recipe.prepTime ? (
              <div>
                <strong>Prep:</strong> {recipe.prepTime} min
              </div>
            ) : null}
            {recipe.cookTime ? (
              <div>
                <strong>Cook:</strong> {recipe.cookTime} min
              </div>
            ) : null}
            {recipe.difficulty ? (
              <div className="px-2 py-2 rounded bg-neutral-200 dark:bg-neutral-700 text-xs font-medium">
                {`Dificulty: ${recipe.difficulty}`}
              </div>
            ) : null}
          </div>
          <div className="flex justify-center mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                size={18}
                className={
                  i < 5
                    ? "text-pastelyellow-500"
                    : "text-neutral-300 dark:text-neutral-600"
                }
              />
            ))}
          </div>
          {isOwner ? (
            <div className="flex flex-col md:flex-row justify-center align-center flex-5 gap-5 p-5">
              <button
                className="btn btn-secondary px-4 py-2"
                onClick={() => {
                  redirect(`/edit/${recipe.id}`);
                }}
              >
                Edit Recipe
              </button>
              <button
                className="btn btn-danger px-4 py-2"
                onClick={() => {
                  deleteRecipe(recipe.id);
                  redirect("/");
                }}
              >
                Delete Recipe
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-6 mx-5">
        {recipe.ingredients?.length ? (
          <div>
            <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {recipe.instructions?.length ? (
          <div>
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal list-inside space-y-1">
              {recipe.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}
        {recipe.author && recipe.author.trim() ? (
          <a
            className="text-sm hover:text-pastelyellow-500 hover:dark:text-pastelyellow-500 text-neutral-600 dark:text-neutral-400 italic mt-4"
            href={`/user/${recipe.ownerId}`}
          >
            Author: {recipe.author}
          </a>
        ) : null}
      </div>
    </div>
  );
}
