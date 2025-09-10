"use client";

import { appContext } from "@/lib/store/app-context";
import { authContext } from "@/lib/store/auth-context";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";

export default function RecipeDetails({ recipe }) {
  if (!recipe) return;
  const { deleteRecipe, favoriteRecipe, rateRecipe } = useContext(appContext);
  const { user, loading } = useContext(authContext);
  const [isOwner, setIsOwner] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [rated, setRated] = useState(null);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [pendingRating, setPendingRating] = useState(false);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!user && !loading && recipe.ratings) {
      if (Object.keys(recipe.ratings).length > 0) {
        let total = 0;
        for (const key in recipe.ratings) {
          total += parseInt(recipe.ratings[key]);
        }
        setRatingAverage(total / Object.keys(recipe.ratings).length);
      }
    }
    if (loading || !user) return;
    if (user.uid == recipe.ownerId) setIsOwner(true);
    if (Array.isArray(recipe.favorites) && recipe.favorites.includes(user.uid))
      setFavorited(true);
    if (recipe.ratings) {
      const ratings = recipe.ratings;
      ratings[user.uid] != null
        ? setRated(parseInt(ratings[user.uid]))
        : setRated(null);
      if (Object.keys(ratings).length > 0) {
        let total = 0;
        for (const key in ratings) {
          total += parseInt(ratings[key]);
        }
        setRatingAverage(total / Object.keys(ratings).length);
      }
    } else {
      setRated(null);
      setRatingAverage(0);
    }
  }, [user, loading]);

  useEffect(() => setHover(0), [recipe, recipe.ratings]);

  async function onToggleFavorite() {
    if (loading || !user || pendingFavorite) return;
    try {
      setPendingFavorite(true);
      const next = !favorited;
      setFavorited(next);

      await favoriteRecipe(recipe.id, next);
    } catch (e) {
      console.error(e);
      setFavorited((prev) => !prev);
    } finally {
      setPendingFavorite(false);
    }
  }

  async function onToggleRatings(rating) {
    if (loading || !user || pendingRating) return;
    try {
      setPendingRating(true);
      const next = rating;
      setRated(rated ? 0 : next);

      await rateRecipe(recipe.id, !rated, next);
    } catch (e) {
      console.error(e);
      setRated(0);
    } finally {
      setPendingRating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-around items-center md:items-start px-10 py-5 rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900">
        <div className="flex-2">
          <div className="relative max-w-md w-2xs md:w-md aspect-[16/9] bg-black">
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
          <div className="flex fles-col justify-center items-center gap-2">
            {recipe.categories?.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 rounded-full border text-xs md:text-sm text-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center items-center gap-2 mt-3">
            {user && !loading && recipe.validated ? (
              <>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const idx = i + 1;
                    const filled = rated ? idx <= rated : false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHover(idx)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onToggleRatings(idx)}
                        disabled={!user || pendingRating}
                        className="p-0.5"
                        title={user ? `Set to ${idx} / 5` : "Sign in to rate"}
                      >
                        <FaStar
                          size={18}
                          className={[
                            "transition-colors duration-150",
                            (hover >= idx || (hover == 0 && filled)) &&
                            !pendingRating &&
                            !(hover > 0 && rated)
                              ? "text-pastelyellow-500"
                              : "text-neutral-300 dark:text-neutral-600",
                            "disabled:text-neutral-400 disabled:dark:text-neutral-700",
                          ].join(" ")}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {recipe.ratings && Object.keys(recipe.ratings).length
                    ? `Avg: ${ratingAverage.toFixed(1)} (of ${
                        Object.keys(recipe.ratings).length
                      })`
                    : "No ratings"}
                </span>
                <button
                  onClick={onToggleFavorite}
                  disabled={pendingFavorite}
                  aria-pressed={favorited}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${
                    favorited
                      ? "bg-pastelmagenta-500 text-white border-pastelmagenta-500"
                      : "border-neutral-300"
                  } disabled:opacity-60`}
                  title={favorited ? "Unfavorite" : "Favorite"}
                >
                  {favorited ? <FaHeart /> : <FaRegHeart />}
                  <span className="text-sm">
                    {favorited ? "Favorited" : "Favorite"}
                  </span>
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col justify-center items-center gap-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {recipe.ratings && Object.keys(recipe.ratings).length
                    ? `Avg: ${ratingAverage.toFixed(1)} (of ${
                        Object.keys(recipe.ratings).length
                      })`
                    : "No ratings"}
                </span>
                <p className="text-sm md:text-md">
                  <a
                    className="text-center text-foreground hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200 underline"
                    href="/login"
                  >
                    Sign in
                  </a>{" "}
                  to favorite and rate recipes!
                </p>
              </div>
            )}
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
