const { GoogleGenAI } = require("@google/genai");
console.log(
  "Gemini API key loaded:",
  !!process.env.GEMINI_API_KEY
);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const CATEGORIES = [
  "Transaction Failure",
  "Customer Support",
  "Login Issues",
  "App Performance",
  "Refund Issues",
  "Authentication",
  "UI/UX",
  "Account Information",
  "Other",
];

const analyzeReviews = async (reviews) => {
  const reviewData = reviews.map((review, index) => ({
    reviewIndex: index + 1,
    review: review.text,
  }));

  const prompt = `
Analyze each customer review independently.

IMPORTANT RULES:
1. Never mix information between different reviews.
2. Preserve the exact reviewIndex.
3. Return exactly ONE result for every input review.
4. Use only: Positive, Negative, Neutral.
5. Use only the allowed categories.

Allowed categories:
${CATEGORIES.join(", ")}

Return ONLY valid JSON.
Do not use markdown or code blocks.

Expected format:
[
  {
    "reviewIndex": 1,
    "sentiment": "Negative",
    "category": "Transaction Failure"
  }
]

Reviews:
${JSON.stringify(reviewData)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  let text = response.text.trim();

  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/i, "");
  text = text.replace(/\s*```$/i, "");

  const results = JSON.parse(text.trim());

  if (!Array.isArray(results)) {
    throw new Error("AI response must be an array");
  }

  if (results.length !== reviews.length) {
    throw new Error("AI did not return a result for every review");
  }

  for (const result of results) {
    if (
      !["Positive", "Negative", "Neutral"].includes(result.sentiment)
    ) {
      throw new Error("Invalid sentiment returned by AI");
    }

    if (!CATEGORIES.includes(result.category)) {
      throw new Error("Invalid category returned by AI");
    }

    if (
      !Number.isInteger(result.reviewIndex) ||
      result.reviewIndex < 1 ||
      result.reviewIndex > reviews.length
    ) {
      throw new Error("Invalid reviewIndex returned by AI");
    }
  }

  return results;
};


// Generate insights from aggregated dataset data
const generateInsights = async (sentiment, categories) => {
  const prompt = `
You are analyzing customer feedback for a software application.

Based ONLY on the aggregated data below, generate 3 to 5 useful business insights.

Sentiment Summary:
${JSON.stringify(sentiment)}

Category-wise Sentiment:
${JSON.stringify(categories)}

Rules:
1. Do not invent information.
2. Mention important positive and negative patterns.
3. Identify major problem areas.
4. Keep each insight short and meaningful.
5. Return ONLY a valid JSON array of strings.
6. Do not use markdown or code blocks.

Example:(please dont use exact same wording everytime)
[
  "Negative reviews account for most of the feedback.",
  "App Performance is a major area of negative feedback.",
  "Customer Support receives both positive and negative feedback."
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  let text = response.text.trim();

  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/i, "");
  text = text.replace(/\s*```$/i, "");

  const insights = JSON.parse(text.trim());

  if (!Array.isArray(insights)) {
    throw new Error("AI insights must be an array");
  }

  if (insights.length < 3 || insights.length > 5) {
    throw new Error("AI must return between 3 and 5 insights");
  }

  return insights;
};

module.exports = {
  analyzeReviews,
  generateInsights,
};