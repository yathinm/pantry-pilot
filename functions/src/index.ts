
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import OpenAI from "openai";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore()

interface RequestData {
  ingredients: string;
}

const OPENAI_API_KEY_SECRET = "OPENAI_API_KEY";


export const generateRecipe = onCall({ secrets: [OPENAI_API_KEY_SECRET] }, async (request) => {
  try {

    if (!process.env.OPENAI_API_KEY) {
      logger.error("FATAL: OPENAI_API_KEY environment variable not set.");
      throw new HttpsError("internal", "Server configuration error: API key not found.");
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to use this feature."
      );
    }

    const data = request.data as RequestData;
    const uid = request.auth.uid;
    const { ingredients } = data;

    if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
      logger.error("Invalid data received:", data);
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with an 'ingredients' property."
      );
    }

    try {
      const ingredientArray = ingredients.toLowerCase().split(/[\s,]+/).filter(Boolean);

      const updates: { [key: string]: admin.firestore.FieldValue } = {};
      for (const ingredient of ingredientArray) {
        updates[`ingredientFrequency.${ingredient}`] = admin.firestore.FieldValue.increment(1);
      }
      
      if (Object.keys(updates).length > 0) {
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update(updates);
        logger.info(`Updated ingredient counts for user ${uid}`, updates);
      }
    } catch (err) {

      logger.error(`Failed to update ingredient frequency for user ${uid}`, err);
    }

    logger.info("v2 Function called with ingredients:", ingredients);

    const prompt = `You are an expert chef. A user has the following ingredients: ${ingredients}. Your first task is to determine if the provided items are edible food ingredients. If the ingredients are clearly not edible (e.g., 'rocks, dirt, plastic'), you MUST respond with the following JSON object: { "title": "Inedible Ingredients", "description": "These ingredients are not edible and cannot be made into a recipe." }. If the ingredients ARE edible, your primary goal is to identify a well-known, classic recipe that can be made using these ingredients. Do not invent a new recipe if a classic one fits. If no classic recipe is a direct match, your secondary goal is to create a new recipe that is closely inspired by a classic dish, using ONLY the ingredients provided. In your response, only list the ingredients from the user's list that are actually used in the recipe. Respond ONLY with a valid JSON object with the following strict structure: { "title": "Recipe Title", "description": "A short, enticing description of the dish. If it's not a classic recipe, mention which classic dish it is similar to.", "ingredients": ["ingredient 1 from user's list", "ingredient 2 from user's list"], "instructions": ["Step 1 of the recipe", "Step 2", "etc."] }`;


    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const recipeJsonString = completion.choices[0].message.content;

    if (!recipeJsonString) {
      throw new Error("OpenAI did not return a recipe.");
    }

    logger.info("Successfully received recipe from OpenAI.");

    return JSON.parse(recipeJsonString);

  } catch (error) {
    logger.error("Unhandled error in generateRecipe function:", error);
    if (error instanceof HttpsError) {
      throw error; 
    }
    throw new HttpsError(
      "internal",
      "An unexpected error occurred."
    );
  }
});
