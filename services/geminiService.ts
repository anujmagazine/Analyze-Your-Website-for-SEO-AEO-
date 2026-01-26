
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeWebsite = async (url: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a world-class SEO (Search Engine Optimization) and AEO (AI Engine Optimization) specialist. 
    Analyze the website: ${url}.
    
    Research this website using your internal knowledge and Google Search to evaluate:
    1. Traditional SEO factors: Technical health, keyword strategy, backlink profile reputation, and mobile-friendliness.
    2. AEO factors: How well this site is structured for LLMs (Large Language Models) like Gemini, GPT-4, and Perplexity. Look for schema.org markup, semantic clarity, factual consistency, and brand authority in AI-driven answers.
    
    Provide a detailed audit in the requested JSON format. Be critical and practical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING },
            summary: { type: Type.STRING },
            overallScore: { type: Type.NUMBER },
            seo: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priority: { type: Type.STRING }
                    },
                    required: ["title", "description", "priority"]
                  }
                }
              },
              required: ["score", "pros", "cons", "recommendations"]
            },
            aeo: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priority: { type: Type.STRING }
                    },
                    required: ["title", "description", "priority"]
                  }
                }
              },
              required: ["score", "pros", "cons", "recommendations"]
            },
            technicalInsights: {
              type: Type.OBJECT,
              properties: {
                structuredData: { type: Type.BOOLEAN },
                mobileOptimization: { type: Type.NUMBER },
                readabilityScore: { type: Type.NUMBER },
                loadTimeEstimate: { type: Type.STRING }
              },
              required: ["structuredData", "mobileOptimization", "readabilityScore", "loadTimeEstimate"]
            }
          },
          required: ["url", "summary", "overallScore", "seo", "aeo", "technicalInsights"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Extract sources from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Search Result",
        uri: chunk.web.uri
      }));

    return {
      ...data,
      timestamp: new Date().toISOString(),
      sources
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze the website. Please check the URL and try again.");
  }
};
