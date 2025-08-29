"use client";

import { auth } from "@/lib/firebase";
import { appContext } from "@/lib/store/app-context";
import { authContext } from "@/lib/store/auth-context";
import { notFound, redirect, useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { FaInfoCircle } from "react-icons/fa";

export default function RecipePage({ params }) {
  const { id } = useParams();
  const { recipes, loading, editRecipe, deleteRecipe } = useContext(appContext);
  const { user } = useContext(authContext);
  const recipe = recipes.find((r) => r.id === id);
  const [missingArmed, setMissingArmed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      setMissingArmed(false);
      return;
    }
    if (!recipe) {
      const t = setTimeout(() => setMissingArmed(true), 150);
      return () => clearTimeout(t);
    }
    if (!user) {
      const t = setTimeout(() => {
        if (!user) redirect("/");
      }, 150);
      return () => clearTimeout(t);
    }
    const isOwner = user && !!user && user.uid === recipe.ownerId;
    if (!isOwner) {
      redirect("/");
    }

    setMissingArmed(false);
    setAuthorized(true);
  }, [loading, recipe, user]);

  useEffect(() => {
    if (!authorized || !recipe) return;

    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];
    const instructions = Array.isArray(recipe.instructions)
      ? recipe.instructions
      : [];

    setIngredientListLength(ingredients.length || 1);
    setInstructionListLength(instructions.length || 1);

    setFormData({
      title: recipe.title ?? "",
      desc: recipe.desc ?? "",
      prepTime: recipe.prepTime ?? 0,
      cookTime: recipe.cookTime ?? 0,
      servings: recipe.servings ?? 1,
      ingredients: ingredients.length ? ingredients : [""],
      instructions: instructions.length ? instructions : [""],
      categories: Array.isArray(recipe.categories) ? recipe.categories : [],
      imageurl: recipe.imageurl ?? "",
    });
  }, [authorized, recipe]);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    ingredients: [""],
    instructions: [""],
    categories: [],
    imageurl: "",
  });
  const [ingredientListLength, setIngredientListLength] = useState(1);
  const [showIngredientTip, setShowIngredientTip] = useState(false);
  const [instructionListLength, setInstructionListLength] = useState(1);
  const [showInstructionTip, setShowInstructionTip] = useState(false);
  const [isOwnerRecipe, setIsOwnerRecipe] = useState(false);

  function ClampInt(value, max, min, nullValue) {
    if (Number.isNaN(value)) return nullValue;
    if (value > max) {
      return max;
    } else if (value < min) {
      return min;
    } else return value;
  }

  function OnFormChange(e) {
    const { name, value, max, type } = e.target;
    if (type == "number" || max) {
      setFormData((prev) => {
        return {
          ...prev,
          [name]: ClampInt(parseInt(value), max, 0, 0),
        };
      });
    } else {
      setFormData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  }

  function OnListChange(e) {
    const { name, value, max, min } = e.target;
    if (name == "ingredientLength") {
      setIngredientListLength(ClampInt(parseInt(value), 32, 1, 1));
      setFormData((prev) => {
        const newList = Array.from(
          { length: ClampInt(parseInt(value), 32, 1, 1) },
          (_, i) => prev.ingredients[i] ?? ""
        );
        return { ...prev, ingredients: newList };
      });
    } else if (name == "instructionLength") {
      setInstructionListLength(ClampInt(parseInt(value), 32, 1, 1));
      setFormData((prev) => {
        const newList = Array.from(
          { length: ClampInt(parseInt(value), 32, 1, 1) },
          (_, i) => prev.instructions[i] ?? ""
        );
        return { ...prev, instructions: newList };
      });
    }
  }

  function OnIngredientChange(value, i) {
    setFormData((prev) => {
      const ingredientCopy = [...prev.ingredients];
      ingredientCopy[i] = value;
      return { ...prev, ingredients: ingredientCopy };
    });
  }

  function OnInstructionChange(value, i) {
    setFormData((prev) => {
      const instructionCopy = [...prev.instructions];
      instructionCopy[i] = value;
      return { ...prev, instructions: instructionCopy };
    });
  }

  function HandleFormSubmit(e) {
    e.preventDefault();
    editRecipe(formData, id);
    redirect("/");
  }

  function HandleDelete() {
    deleteRecipe(id);
    redirect("/");
  }

  if (!authorized) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[320px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!authorized && !loading && !recipe && missingArmed) return notFound();
  if (!isOwnerRecipe && !loading && missingArmed) return redirect("/");

  if (loading) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[320px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-10">
      <div className="flex flex-col mx-auto max-w-2xl">
        <div className="flex justify-between items-center pb-2 px-5">
          <h1 className="text-lg md:text-xl font-bold">Edit Recipe</h1>
          <button className="btn btn-danger px-2 py-1" onClick={HandleDelete}>
            Delete Recipe
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-around items-center md:items-start mx-auto px-10 py-5 rounded-md bg-pastelyellow-50 dark:bg-pastelyellow-900">
          <form className="flex flex-col gap-2" onSubmit={HandleFormSubmit}>
            <div className="flex items-center gap-2">
              <label
                className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                htmlFor="title"
              >
                Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                maxLength={258}
                value={formData.title}
                onChange={OnFormChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                htmlFor="desc"
              >
                Description:
              </label>
              <textarea
                className="w-full min-h-[64px] max-h-[256px] p-2"
                rows={2}
                type="text"
                id="desc"
                name="desc"
                maxLength={8096}
                value={formData.desc}
                onChange={OnFormChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <div className="flex gap-2">
                  <label
                    className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                    htmlFor="imageurl"
                  >
                    Image URL:
                  </label>
                  <input
                    type="text"
                    id="imageurl"
                    name="imageurl"
                    value={formData.imageurl}
                    onChange={OnFormChange}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
                  Preview
                </p>
                <div className="relative flex justify-center bg-black w-[80px] h-[45px]">
                  <img
                    src={formData.imageurl || null}
                    alt="Preview"
                    className="absolute w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2">
                <label
                  className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                  htmlFor="prepTime"
                >
                  Prep Time (minutes):
                </label>
                <input
                  className="w-[60px] pl-2"
                  type="number"
                  inputMode="numeric"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  max={999}
                  onChange={OnFormChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                  htmlFor="cookTime"
                >
                  Cook Time (minutes):
                </label>
                <input
                  className="w-[60px] pl-2"
                  type="number"
                  inputMode="numeric"
                  id="cookTime"
                  name="cookTime"
                  value={formData.cookTime}
                  max={999}
                  onChange={OnFormChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label
                className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                htmlFor="servings"
              >
                Servings:
              </label>
              <input
                className="w-[60px] pl-2"
                type="number"
                inputMode="numeric"
                id="servings"
                name="servings"
                value={formData.servings}
                max={999}
                onChange={OnFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label
                  className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                  htmlFor="ingredientLength"
                >
                  Ingredient List Length:
                </label>
                <input
                  className="w-[60px] pl-2"
                  type="number"
                  inputMode="numeric"
                  id="ingredientLength"
                  name="ingredientLength"
                  value={ingredientListLength}
                  onChange={OnListChange}
                />
              </div>
              <div className="flex">
                <div className="w-[16px] h-[16px]">
                  <FaInfoCircle
                    fill="var(--color-pastelgreen-500)"
                    onClick={() => {
                      setShowIngredientTip(!showIngredientTip);
                    }}
                  />
                </div>
                {showIngredientTip ? (
                  <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
                    Ingredients should be listed in each input as they should
                    show up in each instance of ingredient of the recipe list,
                    do not type only "flour" or "eggs", list the amount,
                    measurement, and ingredient. (Ex: "4 Tbsp butter")
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 p-4 bg-background w-full rounded-md">
                {formData.ingredients.map((v, i) => {
                  return (
                    <input
                      key={`ingredient-${i}`}
                      type="text"
                      name="ingredients"
                      value={v}
                      onChange={(e) => {
                        OnIngredientChange(e.target.value, i);
                      }}
                      required
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label
                  className="text-sm md:text-md font-bold color-pastelyellow-800 dark:color-pastelyellow-100"
                  htmlFor="instructionLength"
                >
                  Instruction List Length:
                </label>
                <input
                  className="w-[60px] pl-2"
                  type="number"
                  inputMode="numeric"
                  id="instructionLength"
                  name="instructionLength"
                  value={instructionListLength}
                  onChange={OnListChange}
                />
              </div>
              <div className="flex">
                <div className="w-[16px] h-[16px]">
                  <FaInfoCircle
                    fill="var(--color-pastelgreen-500)"
                    onClick={() => {
                      setShowInstructionTip(!showInstructionTip);
                    }}
                  />
                </div>

                {showInstructionTip ? (
                  <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
                    Instructions should be listed in order of each step for each
                    instance. It would be best to not make instructions too
                    complicated, and to separate each step to have clear step by
                    step prep and cooking instructions.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 p-4 bg-background w-full rounded-md">
                {formData.instructions.map((v, i) => {
                  return (
                    <input
                      key={`instruction-${i}`}
                      type="text"
                      name="instructions"
                      value={v}
                      onChange={(e) => {
                        OnInstructionChange(e.target.value, i);
                      }}
                      required
                    />
                  );
                })}
              </div>
            </div>
            <p className="text-sm md:text-md text-center text-red-500">
              Warning: Editing a recipe will result in the recipe requiring
              admin re-validation!
            </p>
            <button type="submit" className="btn btn-primary">
              Edit Recipe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
