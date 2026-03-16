
export interface AnalysisResult {
  url: string;
  timestamp: string;
  summary: string;
  overallScore: number;
  seo: {
    score: number;
    pros: string[];
    cons: string[];
    recommendations: { title: string; description: string; priority: 'High' | 'Medium' | 'Low'; howToFix?: string }[];
  };
  aeo: {
    score: number;
    pros: string[];
    cons: string[];
    recommendations: { title: string; description: string; priority: 'High' | 'Medium' | 'Low'; howToFix?: string }[];
  };
  technicalInsights: {
    structuredData: boolean;
    mobileOptimization: number;
    readabilityScore: number;
    loadTimeEstimate: string;
  };
  sources: { title: string; uri: string }[];
  keywordStrategy: {
    keyword: string;
    targetPage: string;
    reason: string;
    difficulty: 'Low' | 'Medium' | 'High';
  }[];
}

export interface HistoryItem {
  url: string;
  score: number;
  timestamp: string;
}
