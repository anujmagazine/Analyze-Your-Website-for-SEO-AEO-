
export interface AnalysisResult {
  url: string;
  timestamp: string;
  summary: string;
  overallScore: number;
  seo: {
    score: number;
    pros: string[];
    cons: string[];
    recommendations: { title: string; description: string; priority: 'High' | 'Medium' | 'Low' }[];
  };
  aeo: {
    score: number;
    pros: string[];
    cons: string[];
    recommendations: { title: string; description: string; priority: 'High' | 'Medium' | 'Low' }[];
  };
  technicalInsights: {
    structuredData: boolean;
    mobileOptimization: number;
    readabilityScore: number;
    loadTimeEstimate: string;
  };
  sources: { title: string; uri: string }[];
}

export interface HistoryItem {
  url: string;
  score: number;
  timestamp: string;
}
