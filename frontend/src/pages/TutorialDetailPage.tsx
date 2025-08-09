import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { CheckCircle, Circle, Clock, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

export const TutorialDetailPage: React.FC = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();

  const { data: tutorial, isLoading } = trpc.tutorials.getById.useQuery(
    { id: tutorialId! },
    { enabled: !!tutorialId }
  );

  const { data: userProgress } = trpc.tutorials.getUserProgress.useQuery(
    { tutorialId: tutorialId! },
    { enabled: !!tutorialId }
  );

  const startTutorialMutation = trpc.tutorials.startTutorial.useMutation();

  const handleStartTutorial = async () => {
    if (!tutorialId) return;
    
    try {
      await startTutorialMutation.mutateAsync({ tutorialId });
      // Navigate to first problem
      if (tutorial?.topics[0]?.problems[0]) {
        window.location.href = `/problems/${tutorial.topics[0].problems[0].id}`;
      }
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  };

  const continueTutorial = () => {
    if (!tutorial || !userProgress) return;
    
    // Find next unsolved problem
    for (const topic of tutorial.topics) {
      for (const problem of topic.problems) {
        const problemProgress = userProgress.problemProgress?.find((p: any) => p.problemId === problem.id);
        if (!problemProgress?.solved) {
          window.location.href = `/problems/${problem.id}`;
          return;
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Tutorial not found</h2>
        <Link to="/tutorials" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
          ← Back to tutorials
        </Link>
      </div>
    );
  }

  const totalProblems = tutorial.topics.reduce((sum: any, topic: any) => sum + topic.problems.length, 0);
  const solvedProblems = userProgress?.problemProgress?.filter((p: any) => p.solved).length || 0;
  const progressPercentage = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tutorial Header */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link to="/tutorials" className="hover:text-primary-600">Tutorials</Link>
              <span>→</span>
              <span>{tutorial.name}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{tutorial.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{tutorial.description}</p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {tutorial.topics.length} topics • {totalProblems} problems
                </span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tutorial.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                tutorial.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tutorial.difficultyLevel}
              </span>
            </div>

            {userProgress ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{solvedProblems}/{totalProblems} completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={continueTutorial} variant="ghost">
                    Continue Learning
                  </Button>
                  {progressPercentage === 100 && (
                    <Button variant="outline" onClick={() => window.location.href = `/tutorials/${tutorial.id}/certificate`}>
                      View Certificate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleStartTutorial} 
                variant="ghost" 
                size="lg"
                // isLoading={startTutorialMutation.isPending}
              >
                Start Tutorial
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Topics and Problems */}
      <div className="space-y-6">
        {tutorial.topics.map((topic: any, topicIndex: any) => (
          <div key={topic.id} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {topicIndex + 1}. {topic.name}
            </h3>
            {topic.description && (
              <p className="text-gray-600 mb-4">{topic.description}</p>
            )}

            <div className="space-y-3">
              {topic.problems.map((problem: any, problemIndex: any) => {
                const problemProgress = userProgress?.problemProgress?.find((p: any) => p.problemId === problem.id);
                const isSolved = problemProgress?.solved || false;
                const attempts = problemProgress?.attempts || 0;
                
                return (
                  <div key={problem.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {isSolved ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} className="text-gray-300" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <Link
                          to={`/problems/${problem.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {topicIndex + 1}.{problemIndex + 1} {problem.title}
                        </Link>
                        
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            problem.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                            problem.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {problem.difficultyLevel}
                          </span>
                          
                          {attempts > 0 && (
                            <span className="text-xs text-gray-500">
                              {attempts} attempt{attempts > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/problems/${problem.id}`}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      {isSolved ? 'Review' : 'Solve'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};