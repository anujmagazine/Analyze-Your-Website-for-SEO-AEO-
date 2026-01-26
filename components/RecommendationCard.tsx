
import React from 'react';

interface RecommendationProps {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

const RecommendationCard: React.FC<RecommendationProps> = ({ title, description, priority }) => {
  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 leading-tight">{title}</h4>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityColors[priority]}`}>
          {priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default RecommendationCard;
