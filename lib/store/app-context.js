"use client";

import { createContext, useState, useEffect, useContext } from "react";

import { auth, db } from "../firebase";
import {
  collection, // reference collection
  addDoc, // add doc
  getDocs, // get doc
  doc, // reference doc
  deleteDoc, // delete doc
  updateDoc, // update doc
  query, // query collection reference
  where, // second part of query, for logic
  orderBy, // organization for query
  limit, // limit for query
} from "firebase/firestore";
import { getIdToken } from "firebase/auth";
import { authContext } from "./auth-context";

export const appContext = createContext({
  recipes: [],
  loading: false,
  addRecipe: async () => {},
  deleteRecipe: async () => {},
  editRecipe: async () => {},
});

export const AppContextProvider = (props) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addRecipe = async (recipe) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Login required");
      const token = await getIdToken(user);

      const response = await fetch("/api/recipes/add-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipe),
        cache: "no-store",
      });
      const data = await response.json();
      // no new recipe, requires validation first
    } catch (error) {
      console.log(`Error creating document: ${error}`);
      setError(error);
      throw error;
    }
  };

  const deleteRecipe = async (recipeId) => {
    const docRef = doc(db, "recipes", recipeId);

    try {
      const docSnap = await deleteDoc(docRef);

      setRecipes((prevState) => {
        return prevState.filter((i) => i.id != recipeId);
      });
    } catch (error) {
      console.log(`Error deleting document: ${error}`);
      setError(error);
      throw error;
    }
  };

  const editRecipe = async (recipeEdit, recipeId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Login required");
      const token = await getIdToken(user);
      const response = await fetch(
        `/api/recipes/edit-recipe?id=${encodeURIComponent(recipeId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(recipeEdit),
          cache: "no-store",
        }
      );
      const data = await response.json();
    } catch (error) {
      console.log(`Error editing document: ${error}`);
      setError(error);
      throw error;
    }
  };

  const values = { recipes, loading, addRecipe, editRecipe, deleteRecipe };

  useEffect(() => {
    let canceled = false;

    async function getRecipeData() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "recipes"),
          where("validated", "==", true),
          limit(24)
        );
        const snap = await getDocs(q);
        if (canceled) return;
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRecipes(data);
      } catch (error) {
        console.error("Failed to load recipes:", error);
        setError(error);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    getRecipeData();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <appContext.Provider value={values}>{props.children}</appContext.Provider>
  );
};
