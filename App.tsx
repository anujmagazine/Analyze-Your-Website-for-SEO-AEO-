
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ShieldCheck, Zap, AlertCircle, CheckCircle2, ListChecks, History, Link as LinkIcon, BarChart3, ChevronRight, Github, Download, Info, HelpCircle, BookOpen, Calendar } from 'lucide-react';
import { analyzeWebsite } from './services/geminiService';
import { AnalysisResult, HistoryItem } from './types';
import ScoreGauge from './components/ScoreGauge';
import RecommendationCard from './components/RecommendationCard';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('audit_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const auditResult = await analyzeWebsite(url);
      setResult(auditResult);
      
      // Update history
      const newHistoryItem: HistoryItem = {
        url: auditResult.url,
        score: auditResult.overallScore,
        timestamp: new Date().toISOString()
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 4)];
      setHistory(updatedHistory);
      localStorage.setItem('audit_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !result) return;
    
    setIsExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `AuditAI-Report-${result.url.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderMetric = (value: number | string | undefined, unit: string = "") => {
    if (value === 0 || value === "0" || value === undefined) {
      return <span className="text-gray-400 font-medium italic">--</span>;
    }
    return <span className="font-semibold text-gray-800">{value}{unit}</span>;
  };

  const getCleanUrl = (rawUrl: string) => {
    try {
      return rawUrl.replace(/^https?:\/\//, '').split('/')[0];
    } catch {
      return rawUrl;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AuditAI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Analyzer</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">AEO Guide</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Case Studies</a>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
              Pro Access
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Search Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Analyze Your Website for <span className="text-indigo-600">SEO</span> & <span className="text-violet-600">AEO</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Traditional search is evolving. Optimize for both Google's crawler and AI Search Engines (Perplexity, Gemini, ChatGPT) with our deep-scanning audit tool.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto relative">
            <div className="flex items-center p-2 bg-white rounded-2xl shadow-xl border border-gray-200">
              <Globe className="w-6 h-6 text-gray-400 ml-4 hidden sm:block" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-gray-800"
              />
              <button
                disabled={isAnalyzing}
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Audit Now</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-red-500 bg-red-50 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </form>

          {/* Mini History */}
          {!result && history.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in">
               <span className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center space-x-1">
                 <History className="w-3 h-3" />
                 <span>Recent Audits</span>
               </span>
               {history.map((item, idx) => (
                 <button
                  key={idx}
                  onClick={() => setUrl(item.url)}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all text-sm text-gray-600"
                 >
                   <span className="truncate max-w-[120px]">{item.url.replace(/^https?:\/\//, '')}</span>
                   <span className="font-bold text-xs">{item.score}</span>
                 </button>
               ))}
            </div>
          )}
        </section>

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
               <Zap className="w-8 h-8 text-indigo-600 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Scanning for Best Practices...</h3>
            <p className="text-gray-500 text-sm mt-2">Connecting to AI Audit Engine...</p>
          </div>
        )}

        {/* Audit Result Display */}
        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            {/* Action Bar for Results */}
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold text-gray-900">Audit Report</h2>
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm disabled:opacity-50"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? 'Generating PDF...' : 'Download Report'}</span>
              </button>
            </div>

            <div ref={reportRef} className="space-y-8 p-1">
              {/* Professional Document Title Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 border-l-4 border-l-indigo-600">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Official Strategy Audit</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                      SEO & AEO Analysis for <span className="text-indigo-600">{getCleanUrl(result.url)}</span>
                    </h1>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <ScoreGauge score={result.overallScore} label="Overall Score" />
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                    <p className={`font-bold ${result.overallScore > 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.overallScore > 75 ? 'Good Performance' : 'Needs Optimization'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <BarChart3 className="w-32 h-32 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <ListChecks className="w-6 h-6 mr-2 text-indigo-600" />
                    Executive Summary
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-2xl mb-6">
                    {result.summary}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                        Structured Data
                        <Info className="w-3 h-3 ml-1 text-gray-300" title="JSON-LD / Schema.org presence" />
                      </p>
                      <div className="flex items-center space-x-1">
                        {result.technicalInsights.structuredData ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-semibold">{result.technicalInsights.structuredData ? 'Present' : 'Missing'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Mobile Opt.</p>
                      {renderMetric(result.technicalInsights.mobileOptimization, "%")}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Readability</p>
                      {renderMetric(result.technicalInsights.readabilityScore, "/100")}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Est. Load</p>
                      {renderMetric(result.technicalInsights.loadTimeEstimate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Methodology Explainer */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" />
                      How we calculate your score
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Our proprietary algorithm analyzes your site through the lens of a weighted system that balances traditional indexing with AI engine readability.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Technical Health (30%)</p>
                        <p className="text-[13px] text-gray-600">Speed, crawlability, and mobile performance.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Content Depth (40%)</p>
                        <p className="text-[13px] text-gray-600">Quality, intent matching, and semantic clarity.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                        <p className="text-xs font-bold text-violet-600 uppercase mb-2">AEO Readiness (30%)</p>
                        <p className="text-[13px] text-gray-600">Schema markup and data connectivity for LLMs.</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/3 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Terminology Guide
                    </h4>
                    <ul className="space-y-4">
                      <li className="text-xs leading-relaxed">
                        <span className="font-bold text-gray-700 block mb-0.5">E-E-A-T</span>
                        Experience, Expertise, Authoritativeness, and Trustworthiness. The pillar of modern search quality.
                      </li>
                      <li className="text-xs leading-relaxed">
                        <span className="font-bold text-gray-700 block mb-0.5">SEO (Search Engine Optimization)</span>
                        Traditional optimization for crawlers like Googlebot to rank in SERPs.
                      </li>
                      <li className="text-xs leading-relaxed">
                        <span className="font-bold text-gray-700 block mb-0.5">AEO (AI Engine Optimization)</span>
                        Structuring data so AI models can accurately extract and cite your site as a primary source.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Deep Dives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SEO Analysis */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Traditional SEO Analysis
                    </h3>
                    <div className="bg-white px-3 py-1 rounded-full text-indigo-600 font-bold text-sm shadow-sm">
                      {result.seo.score}/100
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Strengths & Weaknesses</h4>
                      <div className="space-y-2">
                        {result.seo.pros.slice(0, 3).map((pro, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm text-gray-700 bg-green-50/50 p-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                        {result.seo.cons.slice(0, 3).map((con, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm text-gray-700 bg-red-50/50 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Actions</h4>
                      {result.seo.recommendations.map((rec, i) => (
                        <RecommendationCard key={i} {...rec} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* AEO Analysis */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-violet-50 border-b border-violet-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-violet-900 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      AI Engine Optimization (AEO)
                    </h3>
                    <div className="bg-white px-3 py-1 rounded-full text-violet-600 font-bold text-sm shadow-sm">
                      {result.aeo.score}/100
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">LLM Visibility Factors</h4>
                      <div className="space-y-2">
                        {result.aeo.pros.slice(0, 3).map((pro, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm text-gray-700 bg-green-50/50 p-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                        {result.aeo.cons.slice(0, 3).map((con, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm text-gray-700 bg-red-50/50 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Readiness Actions</h4>
                      {result.aeo.recommendations.map((rec, i) => (
                        <RecommendationCard key={i} {...rec} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sources & Grounding */}
              {result.sources && result.sources.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Audit Reference Sources</h4>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {result.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm"
                      >
                        {source.title}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informational Section (Empty State) */}
        {!result && !isAnalyzing && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Traditional SEO</h3>
              <p className="text-gray-500 text-sm">We analyze meta tags, headers, and performance metrics to ensure your site is visible to Google and Bing's classic search index.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Next-Gen AEO</h3>
              <p className="text-gray-500 text-sm">Artificial Intelligence Engines scan for structured data and semantic authority. We help you get cited by AI answer engines.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ListChecks className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Actionable Roadmap</h3>
              <p className="text-gray-500 text-sm">Don't just get scores. Get a prioritized checklist of exactly what to change to see immediate rankings and traffic improvements.</p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <ShieldCheck className="text-gray-600 w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800">AuditAI</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AuditAI. Powered by Gemini 3 Pro Search Grounding.
          </p>
          <div className="flex items-center space-x-6">
             <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
               <Github className="w-5 h-5" />
             </a>
             <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Terms</a>
             <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
