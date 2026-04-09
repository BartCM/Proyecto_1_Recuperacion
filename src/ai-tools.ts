/* eslint-disable */
declare const LanguageDetector: any;
declare const Translator: any;
declare const Summarizer: any;

export async function detectLanguage(text: string): Promise<string> {
  const detector = await LanguageDetector.create();
  const results = await detector.detect(text);

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("Could not detect the language");
  }

  const firstResult = results[0];

  if (
    typeof firstResult === "object" &&
    firstResult !== null &&
    "detectedLanguage" in firstResult &&
    typeof firstResult.detectedLanguage === "string"
  ) {
    return firstResult.detectedLanguage;
  }

  throw new Error("Invalid language detection result");
}

export async function translateToEnglish(text: string): Promise<string> {
  const language = await detectLanguage(text);

  if (language.toLowerCase().startsWith("en")) {
    throw new Error("The description is already in English");
  }

  const translator = await Translator.create({
    sourceLanguage: language,
    targetLanguage: "en",
  });

  return await translator.translate(text);
}

export async function generateTitle(text: string): Promise<string> {
  if (text.trim().length < 20) {
    throw new Error("Description must contain at least 20 characters");
  }

  const summarizer = await Summarizer.create({
    type: "headline",
    format: "plain-text",
    length: "short",
    context:
      "A catchy title for selling a real state property in the market fast",
  });

  return await summarizer.summarize(text);
}
/* eslint-enable */
