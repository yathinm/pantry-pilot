import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import OpenAI from "openai";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Rate limit: max API calls per user per window (applies to both recipe endpoints)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20;

interface RateLimitState {
  count: number;
  windowStart: admin.firestore.Timestamp;
}

/**
 * Checks rate limit for the user and increments count in a transaction.
 * Throws HttpsError "resource-exhausted" if over limit.
 */
async function checkAndIncrementRateLimit(uid: string): Promise<void> {
  const ref = db.collection("rateLimits").doc(uid);
  await db.runTransaction(async (tx) => {
    const now = admin.firestore.Timestamp.now();
    const doc = await tx.get(ref);
    let state: RateLimitState;

    if (!doc.exists) {
      state = { count: 0, windowStart: now };
    } else {
      const data = doc.data() as RateLimitState;
      const elapsed = now.toMillis() - data.windowStart.toMillis();
      if (elapsed >= RATE_LIMIT_WINDOW_MS) {
        state = { count: 0, windowStart: now };
      } else {
        state = { count: data.count, windowStart: data.windowStart };
      }
    }

    if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
      throw new HttpsError(
        "resource-exhausted",
        `Rate limit exceeded. You can make up to ${RATE_LIMIT_MAX_REQUESTS} recipe requests per hour. Try again later.`
      );
    }

    tx.set(ref, {
      count: state.count + 1,
      windowStart: state.windowStart,
    });
  });
}

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

    await checkAndIncrementRateLimit(uid);

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

    const prompt = `You are an expert chef. A user has the following ingredients: ${ingredients}.

Your first task is to determine if the provided items are edible food ingredients. If they are clearly not edible (e.g., rocks, dirt, plastic), respond ONLY with this JSON object: { "title": "Inedible Ingredients", "description": "These ingredients are not edible and cannot be made into a recipe." }.

If the ingredients ARE edible:
- Prefer a well-known classic recipe that fits; otherwise create one clearly inspired by a classic dish.
- Base the dish primarily on the user's list. You MAY add minimal pantry staples only when necessary for a coherent recipe: salt, black pepper, neutral cooking oil OR butter, water, and alliums/herbs/spices only if the user already listed something in that family (e.g. garlic, onion). Every staple you use must appear in "ingredients" with a quantity—never mention something in instructions that is not listed there.
- Ingredients array: each entry must be specific and actionable—approximate quantity + unit (imperial or metric, pick one system and stay consistent), the food name, and preparation when it matters (e.g. "1 lb boneless chicken thighs, cut into 1-inch pieces", "1 medium lemon, zest and 3 tbsp juice"). Include ingredient types/cuts when relevant (breast vs thigh, rice variety if inferable).
- If the recipe includes raw meat, poultry, or fish: instructions MUST explain how to prepare and season it before or during cooking (dry/pat dry if applicable, salt and pepper amounts or "to taste", any rub or marinade timing using only listed ingredients, browning/simmering cues). Do not assume protein is already cooked unless the user's ingredients imply it (e.g. "rotisserie chicken", "cooked rice").
- Instructions: numbered logical steps; include heat levels and rough times where helpful; season/taste adjustments at the end when appropriate.
- Do not leave gaps (e.g. "add broth" without broth or water + bouillon in ingredients).

Respond ONLY with valid JSON in this exact shape: { "title": "Recipe Title", "description": "A short, enticing description; if not a classic recipe, say which classic it resembles.", "ingredients": ["quantity + detail ..."], "instructions": ["Step 1 ...", "Step 2 ..."] }`;


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


const OPENAI_API_KEY_SECRET_REC = "OPENAI_API_KEY"; 

export const getRecommendedRecipes = onCall({ secrets: [OPENAI_API_KEY_SECRET_REC] }, async (request) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error("FATAL: OPENAI_API_KEY environment variable not set.");
      throw new HttpsError("internal", "Server configuration error: API key not found.");
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to use this feature.");
    }
    const uid = request.auth.uid;

    await checkAndIncrementRateLimit(uid);

    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User data not found.");
    }

    const userData = userDoc.data();
    const ingredientFrequency = userData?.ingredientFrequency || {};

    const topIngredients = Object.entries(ingredientFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name]) => name);

    if (topIngredients.length === 0) {
      topIngredients.push("chicken", "rice", "cheese"); 
    }

    logger.info(`Generating recommendations for user ${uid} based on top ingredients:`, topIngredients);

    const prompt = `You are a recipe recommender. A user frequently cooks with: ${topIngredients.join(', ')}. Suggest 3 new, interesting, moderately simple recipes that fit those flavors.

For EACH recommendation:
- Ingredients: every item needs approximate quantity + unit (consistent imperial OR metric), specific names/cuts where useful, and prep notes when needed (e.g. diced, minced). Include minimal pantry staples only if required (salt, pepper, oil/butter, water); list every one with quantities. Nothing may appear only in instructions—it must be in the ingredients list too.
- Instructions: clear steps with heat and rough times when helpful. If a recipe uses meat, poultry, or fish, include explicit seasoning and protein-cooking steps (not "use cooked chicken" unless the dish truly requires pre-cooked protein—prefer teaching seasoning and cooking from raw when sensible).

Respond ONLY with valid JSON: { "recommendations": [{ "title": "...", "description": "...", "ingredients": ["quantity ..."], "instructions": ["Step 1 ..."] }] }`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const responseJsonString = completion.choices[0].message.content;
    if (!responseJsonString) {
      throw new Error("OpenAI did not return recommendations.");
    }

    const parsedResponse = JSON.parse(responseJsonString);
    return parsedResponse.recommendations;

  } catch (error) {
    logger.error("Unhandled error in getRecommendedRecipes function:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "An unexpected error occurred while generating recommendations."
    );
  }
});