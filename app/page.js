"use client";

import { useContext, useEffect, useState } from "react";
import RecipeList from "./components/recipeList";
import { appContext } from "@/lib/store/app-context";
import SearchBar from "./components/searchBar";
import { auth } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

export default function Home() {
  const { recipes } = useContext(appContext);
  const [searchParams, setSearchParams] = useState({
    title: "",
    category: "_",
    type: "_",
  });
  const [showRecipes, setShowRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);

  function searchInput(e) {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function GetCategories() {
    if (!recipes) return;
    let allCategories = [];
    recipes.forEach((recipe) => {
      if (recipe.categories) {
        recipe.categories.forEach((category) => {
          if (!allCategories.includes(category)) allCategories.push(category);
        });
      }
    });
    allCategories.sort();
    return allCategories;
  }

  function GetRatings(obj) {
    let total = 0;
    for (const key in obj) {
      total += parseInt(obj[key]);
    }
    return total / Object.keys(obj).length;
  }

  useEffect(() => {
    if (!recipes) return;
    let searchRecipes = recipes;
    let searchByPref = false;
    searchRecipes.sort((a, b) => {
      const dateA = a.createdAt.toMillis();
      const dateB = b.createdAt.toMillis();
      return dateB - dateA;
    });
    if (searchParams.category != "_") {
      searchRecipes = searchRecipes.filter(
        (recipe) =>
          recipe.categories && recipe.categories.includes(searchParams.category)
      );
    }
    if (searchParams.type != "_") {
      switch (searchParams.type) {
        case "new":
          break;
        case "popular":
          searchRecipes.sort((a, b) => {
            let ratingsA, ratingsB;
            ratingsA = a.ratings ? (ratingsA = GetRatings(a.ratings)) : 0;
            ratingsB = b.ratings ? (ratingsB = GetRatings(b.ratings)) : 0;
            return ratingsB - ratingsA;
          });
          break;
        case "favorited":
          searchByPref = true;
          if (auth.currentUser) {
            searchRecipes = searchRecipes.filter(
              (recipe) =>
                recipe.favorites &&
                recipe.favorites.includes(auth.currentUser.uid)
            );
          }
          break;

        default:
          break;
      }
    } else {
      searchByPref = true;
    }
    if (searchByPref && auth.currentUser) {
      searchRecipes.sort((a, b) => {
        const rateA =
          a.ratings && Object.keys(a.ratings).includes(auth.currentUser.uid)
            ? a.ratings[auth.currentUser.uid]
            : 0;
        const rateB =
          b.ratings && Object.keys(b.ratings).includes(auth.currentUser.uid)
            ? b.ratings[auth.currentUser.uid]
            : 0;
        return rateB - rateA;
      });
    }
    if (searchParams.title.trim() != null && searchParams.title != "") {
      searchRecipes = searchRecipes.filter(
        (recipe) =>
          recipe.title
            .toLowerCase()
            .startsWith(searchParams.title.toLowerCase()) ||
          recipe.desc.toLowerCase().startsWith(searchParams.title.toLowerCase())
      );
      searchRecipes.sort((a, b) => {
        const sortA = a.title
          .toLowerCase()
          .startsWith(searchParams.title.toLowerCase())
          ? 1
          : 0;
        const sortB = b.title
          .toLowerCase()
          .startsWith(searchParams.title.toLowerCase())
          ? 1
          : 0;
        return sortB - sortA;
      });
    }
    if (searchRecipes) {
      const max = Math.ceil(searchRecipes.length / 4);
      setMaxPages(max);
      if (page > max && max > 0) setPage(max);
    }
    setShowRecipes(searchRecipes.slice(page * 4 - 4, page * 4));
  }, [auth.currentUser, recipes, searchParams, page]);

  return (
    <div className="flex flex-col gap-5 p-10">
      <div id="allRecipesList">
        <h1 className="text-lg md:text-xl font-bold ml-5">Recipes</h1>
        <SearchBar searchInput={searchInput} categories={GetCategories()} />
        {showRecipes && showRecipes.length > 0 ? (
          <RecipeList linkPref={"/recipe/"} recipes={showRecipes} />
        ) : (
          <div className="flex flex-col md:flex-row flex-wrap justify-start gap-5 w-auto my-[1rem] md:my-[2rem] p-[1rem] rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900 rounded-md">
            <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
              Couldn't find recipes for that search
            </p>
          </div>
        )}

        {showRecipes && maxPages > 1 ? (
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
    </div>
  );
}
