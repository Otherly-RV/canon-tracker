import { useState, useCallback } from "react";
import { buildFieldPrompt } from "../utils/prompt-builder.ts";
import { IdentifiedEntities } from "../types.ts";

async function callGemini(prompt: string) {
  const r = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Gemini request failed");
  return String(data.text || "");
}

export const useAiAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifyEntities = useCallback(
    async (documentText: string, execContractText: string): Promise<IdentifiedEntities> => {
      const prompt = `
${execContractText}

**TASK:**
Analyze the provided source document and identify the primary characters and locations.
- For characters, list the names of the main protagonist, antagonist, and key supporting characters.
- For locations, list the names of the most important and frequently mentioned settings.
- Return ONLY a JSON object with two keys: "characters" and "locations", each containing an array of strings.

**SOURCE OF TRUTH (Hard Canon):**
---
${documentText}
---

Respond ONLY with the specified JSON object.
`;

      const text = await callGemini(prompt);
      return JSON.parse(text) as IdentifiedEntities;
    },
    []
  );

  const generateContentForAllFields = useCallback(
    async (
      documentText: string,
      checklistItems: string[],
      execContractText: string,
      fieldRules: any,
      onFieldCompleted: (path: string, content: string) => void
    ) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        for (const fieldPath of checklistItems) {
          const prompt = buildFieldPrompt(fieldPath, documentText, execContractText, fieldRules);
          const text = await callGemini(prompt);
          onFieldCompleted(fieldPath, text.trim());
        }
      } catch (e: any) {
        setError(e?.message || "Generation failed");
        setIsAnalyzing(false);
        throw e;
      }

      setIsAnalyzing(false);
    },
    []
  );

  return { identifyEntities, generateContentForAllFields, isAnalyzing, error };
};
