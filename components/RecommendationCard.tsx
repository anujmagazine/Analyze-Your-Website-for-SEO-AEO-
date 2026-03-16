
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface RecommendationProps {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  howToFix?: string;
}

const RecommendationCard: React.FC<RecommendationProps> = ({ title, description, priority, howToFix }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 leading-tight pr-4">{title}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{description}</p>
        
        {howToFix && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Solution' : 'How to Fix'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isExpanded && howToFix && (
        <div className="bg-indigo-50/50 border-t border-indigo-100 p-4 animate-in slide-in-from-top-2 duration-200">
          <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <span>Implementation Guide</span>
          </h5>
          <div className="text-sm text-indigo-900/80 leading-relaxed whitespace-pre-wrap">
            {howToFix}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
