/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Limits cache size to avoid localStorage overflow
const MAX_CACHE_ENTRIES = 500;

function getCache(): Record<string, string> {
  try {
    const cached = localStorage.getItem("ai_translation_cache");
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setCache(key: string, value: string) {
  try {
    const cache = getCache();
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE_ENTRIES) {
      // remove oldest
      delete cache[keys[0]];
    }
    cache[key] = value;
    localStorage.setItem("ai_translation_cache", JSON.stringify(cache));
  } catch (e) {
    console.error("Cache set error", e);
  }
}

export function useAITranslation(text: string | undefined): string {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text || "");

  useEffect(() => {
    if (!text || text.trim() === "") {
      setTranslatedText("");
      return;
    }

    const currentLang = (i18n.language || "az").substring(0, 2);
    
    // Assume backend data is natively Azerbaijani, so no translation needed if 'az'
    if (currentLang === "az") {
      setTranslatedText(text);
      return;
    }

    const targetLang = "English";

    // Hash or simply use the string as key if it's less than 100 chars
    // Since we want to handle descriptions, maybe use a hash or base64 (to be safe with characters)
    const strHash = btoa(encodeURIComponent(text.substring(0, 150)));
    const cacheKey = `${currentLang}_${strHash}`;
    
    const cache = getCache();
    if (cache[cacheKey]) {
      setTranslatedText(cache[cacheKey]);
      return;
    }

    // fallback to original while loading
    setTranslatedText(text);

    if (!ai) return;

    let isMounted = true;
    const translate = async () => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are a professional luxury brand translator. Translate the following Azerbaijani text into elegant, premium ${targetLang} suitable for a high-end leather goods brand. Output ONLY the translated text without quotes or markdown:\n\n${text}`,
        });
        const result = response.text?.trim();
        if (result && isMounted) {
          setCache(cacheKey, result);
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("AI Translation Error: ", error);
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, i18n.language]);

  return translatedText;
}
