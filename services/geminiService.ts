
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeWebsite = async (url: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a world-class SEO (Search Engine Optimization) and AEO (AI Engine Optimization) specialist. 
    Analyze the website: ${url}.
    
    ### STRICT CONSISTENCY REQUIREMENT:
    You must use a standardized, deterministic scoring protocol. If you analyze the same URL twice, your scores should be identical.
    
    ### SCORING RUBRIC:
    1. SEO (Search Engine Optimization):
       - Technical (H1s, Meta, Alt Tags): 40 pts
       - Performance (Speed estimates): 30 pts
       - Authority (Backlink reputation): 30 pts
    
    2. AEO (AI Engine Optimization):
       - Structured Data (Schema.org): 40 pts
       - Semantic Clarity (Direct answers): 30 pts
       - E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness): 30 pts
    
    Research this website using your internal knowledge and Google Search to evaluate these specific points.
    
    For the technicalInsights section, please provide realistic estimates:
    - mobileOptimization: A percentage score (1-100) based on responsive design best practices.
    - readabilityScore: A score (1-100) based on content complexity (like Flesch-Kincaid). Do NOT return 0.
    - loadTimeEstimate: A string estimate like "1.2s" or "2.5s".
    
    Provide a detailed audit in the requested JSON format. Be objective, critical, and consistent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        // Setting temperature to 0 and providing a seed ensures consistency
        temperature: 0,
        seed: 42,
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
