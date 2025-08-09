import React from 'react';
import { Link } from 'react-router-dom';
import { trpc } from '../lib/trpc';

export const TutorialsPage: React.FC = () => {
  const { data: tutorials, isLoading } = trpc.tutorials.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tutorials</h1>
        <p className="text-gray-600 mt-2">Choose a tutorial to start learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials?.map((tutorial: any) => (
          <div key={tutorial.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{tutorial.name}</h3>
                <p className="text-gray-600 mt-1">{tutorial.description}</p>
                
                <div className="mt-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    tutorial.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    tutorial.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tutorial.difficultyLevel}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {tutorial.topics.length} topics • {tutorial.topics.reduce((acc: any, topic: any) => acc + topic.problems.length, 0)} problems
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to={`/tutorials/${tutorial.id}`}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Start Tutorial
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {tutorial.topics.slice(0, 3).map((topic: any) => (
                <div key={topic.id} className="text-sm">
                  <span className="font-medium text-gray-700">{topic.name}</span>
                  <span className="text-gray-500 ml-2">({topic.problems.length} problems)</span>
                </div>
              ))}
              {tutorial.topics.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{tutorial.topics.length - 3} more topics
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};