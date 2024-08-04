import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { firestore } from "@/firebase";

const SECRET_KEY = "AIzaSyBKydN1c17UL0PShV8c3jGEC0h5CRmE-KU";

// Fetch items from Firestore for a specific user
const fetchAvailableItems = async (userId) => {
  if (typeof userId !== "string" || !userId) {
    throw new Error("Invalid userId provided.");
  }

  try {
    const docRef = doc(firestore, "pantry", userId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const items = docSnapshot.data()?.items;

      if (items) {
        // Convert the items object to an array of item names
        const ingredientNames = Object.keys(items).map(
          (key) => items[key].name || key
        );
        // console.log("Fetched items from Firestore:", ingredientNames);
        return ingredientNames;
      } else {
        // console.log("No 'items' field found in the document.");
        return [];
      }
    } else {
      // console.log("No document found for the specified user ID.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching available items:", error);
    throw error;
  }
};

export const RecipeService = async (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    console.error("Invalid ingredients provided:", ingredients);
    throw new Error("Invalid ingredients provided.");
  }

  // Log the ingredients
  // console.log("Ingredients:", ingredients);

  // Find possible recipes
  try {
    const recipes = await findPossibleRecipes(ingredients);
    return recipes;
  } catch (error) {
    console.error("Error finding recipes:", error);
    throw error;
  }
};

const findPossibleRecipes = async (ingredients) => {
  const chat = new ChatGoogleGenerativeAI({ apiKey: SECRET_KEY });

  // My Prompt
  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(
    "Your name is Aman. You are a master chef. Introduce yourself as Aman The Master Chef. You can provide recipes based on the following available ingredients. Please give 3 recipes that can be made with these ingredients."
  );

  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(
    `Available ingredients are: ${ingredients.join(
      ", "
    )}. Please provide 3 possible recipes that can be made with these ingredients.`
  );

  const chatPrompt = ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt,
  ]);

  const formattedChatPrompt = await chatPrompt.formatMessages({
    asked_recipe: "Please provide 3 possible recipes.",
  });

  try {
    const response = await chat.invoke(formattedChatPrompt);
    return response.content;
  } catch (error) {
    console.error("Error invoking chat:", error);
    throw error;
  }
};
