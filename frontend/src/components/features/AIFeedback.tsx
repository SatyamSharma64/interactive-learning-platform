import React from 'react';
import { Brain, Lightbulb, Target } from 'lucide-react';

interface AIFeedbackProps {
  analysis: {
    feedback: string;
    suggestions: string[];
    hint?: string;
    confidence: number;
    errorTypes: string[];
  };
  attemptNumber: number;
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ analysis, attemptNumber }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center">
          <Brain className="text-purple-500 mr-2" size={20} />
          AI Analysis (Attempt #{attemptNumber})
        </h3>
        <div className="flex items-center mt-2">
          <span className="text-sm text-gray-600">Confidence: </span>
          <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${analysis.confidence * 10}%` }}
            />
          </div>
          <span className="ml-2 text-sm text-gray-600">{analysis.confidence}/10</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Target size={16} className="mr-1 text-red-500" />
            What went wrong:
          </h4>
          <p className="text-gray-700 text-sm bg-red-50 p-3 rounded-lg">
            {analysis.feedback}
          </p>
        </div>

        {analysis.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Suggestions for improvement:</h4>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.hint && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Lightbulb size={16} className="mr-1 text-yellow-500" />
              Hint:
            </h4>
            <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded-lg">
              {analysis.hint}
            </p>
          </div>
        )}

        {analysis.errorTypes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Error categories:</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.errorTypes.map((type, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};