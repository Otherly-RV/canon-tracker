
import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { buildFieldPrompt } from '../utils/prompt-builder.ts';
import { IdentifiedEntities } from '../types.ts';

const API_KEY = process.env.API_KEY;
if (!API_KEY) console.warn("API_KEY environment variable not set. AI analysis will fail.");

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });
const model = 'gemini-2.5-flash';

export const useAiAnalysis = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const identifyEntities = useCallback(async (documentText: string, execContractText: string): Promise<IdentifiedEntities> => {
        const prompt = `
${execContractText}

**TASK:**
Analyze the provided source document and identify the primary characters and locations.
- For characters, list the names of the main protagonist, antagonist, and key supporting characters.
- For locations, list the names of the most important and frequently mentioned settings.
- Return ONLY a JSON object with two keys: "characters" and "locations", each containing an array of strings.

**SOURCE OF TRUTH (Hard Canon):**
---
${documentText.substring(0, 50000)}
---

Respond ONLY with the specified JSON object.
`;
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                locations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['characters', 'locations'],
        };

        try {
            const response = await ai.models.generateContent({
                model,
                contents: { role: 'user', parts: [{ text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema, temperature: 0.1 },
            });
            const result = JSON.parse(response.text);
            return result as IdentifiedEntities;
        } catch (e) {
            console.error("Error identifying entities:", e);
            throw new Error("Failed to identify characters and locations from the document.");
        }
    }, []);

    const generateContentForAllFields = useCallback(async (
        documentText: string,
        checklistItems: string[],
        execContractText: string,
        fieldRules: any,
        onFieldCompleted: (path: string, content: string) => void
    ): Promise<void> => {
        setIsAnalyzing(true);
        setError(null);

        if (!API_KEY) {
            const msg = "Gemini API key is not configured.";
            setError(msg);
            setIsAnalyzing(false);
            throw new Error(msg);
        }

        for (const fieldPath of checklistItems) {
            try {
                const prompt = buildFieldPrompt(fieldPath, documentText, execContractText, fieldRules);
                
                const response = await ai.models.generateContent({
                    model,
                    contents: { role: 'user', parts: [{ text: prompt }] },
                    config: { temperature: 0.2 },
                });

                const content = response.text.trim();
                onFieldCompleted(fieldPath, content);

            } catch (e) {
                console.error(`Error processing field ${fieldPath}:`, e);
                let errorMessage = `Error on field ${fieldPath}.`;
                if (e instanceof Error) errorMessage = e.message;
                setError(errorMessage);
                setIsAnalyzing(false);
                throw new Error(errorMessage);
            }
        }
        setIsAnalyzing(false);
    }, []);

    return { identifyEntities, generateContentForAllFields, isAnalyzing, error };
};
