
import React from 'react';
import type { GradingResponse } from '../types';
import { GradeDonutChart } from './GradeDonutChart';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ResultsDisplayProps {
  result: GradingResponse;
  onReset: () => void;
}

const FeedbackList: React.FC<{ title: string; items: string[]; icon: React.ReactNode; itemClass: string; }> = ({ title, items, icon, itemClass }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
    <ul className="space-y-3">
      {items.map((point, index) => (
        <li key={index} className="flex items-start">
          <span className={`flex-shrink-0 w-6 h-6 mr-3 mt-1 ${itemClass}`}>
            {icon}
          </span>
          <span className="text-gray-700 text-right w-full" dir="rtl">{point}</span>
        </li>
      ))}
      {items.length === 0 && <li className="text-gray-500 italic">None provided.</li>}
    </ul>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Analysis Complete</h2>
      
      <div className="flex justify-center mb-6">
        <GradeDonutChart score={result.recommendedGrade} />
      </div>

      <div className="space-y-8 mb-8 flex-grow">
        <FeedbackList
          title="Positive Points"
          items={result.positivePoints}
          icon={<CheckIcon />}
          itemClass="text-green-500"
        />
        <FeedbackList
          title="Areas for Improvement"
          items={result.areasForImprovement}
          icon={<XCircleIcon />}
          itemClass="text-red-500"
        />
      </div>

      <button
        onClick={onReset}
        className="w-full mt-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        Grade Another Homework
      </button>
    </div>
  );
};
