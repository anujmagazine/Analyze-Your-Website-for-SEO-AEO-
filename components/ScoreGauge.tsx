
import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  color?: string;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, color = "blue" }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColorClass = (s: number) => {
    if (s >= 80) return 'text-green-500 stroke-green-500';
    if (s >= 50) return 'text-yellow-500 stroke-yellow-500';
    return 'text-red-500 stroke-red-500';
  };

  const colorClass = getColorClass(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <circle
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>
        <span className={`absolute text-xl font-bold ${colorClass.split(' ')[0]}`}>
          {score}
        </span>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default ScoreGauge;
