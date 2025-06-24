
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import OpenAI from "openai";

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
    const { ingredients } = data;

    if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
      logger.error("Invalid data received:", data);
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with an 'ingredients' property."
      );
    }

    logger.info("v2 Function called with ingredients:", ingredients);

    const prompt = `You are a helpful culinary assistant. A user has the following ingredients: ${ingredients}. Generate a single recipe they can make. Respond ONLY with a valid JSON object with the following structure: { "title": "Recipe Title", "description": "A short, enticing description", "ingredients": ["string"], "instructions": ["Step 1", "Step 2"] }`;

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
