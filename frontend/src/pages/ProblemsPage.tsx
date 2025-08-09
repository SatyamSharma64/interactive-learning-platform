import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const ProblemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  const allowedDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
  const difficultyValue = allowedDifficulties.includes(difficultyFilter as any)
    ? (difficultyFilter as typeof allowedDifficulties[number])
    : undefined;

  const allowedStatuses = ['SOLVED', 'ATTEMPTED', 'NOT_ATTEMPTED'] as const;
  const statusValue = allowedStatuses.includes(statusFilter as any)
    ? (statusFilter as typeof allowedStatuses[number])
    : undefined;

  const { data: problems, isLoading } = trpc.problems.getAll.useQuery({
    search: searchTerm,
    difficulty: difficultyValue,
    status: statusValue,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (difficultyFilter !== 'ALL') params.set('difficulty', difficultyFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Problems</h1>
          <p className="text-gray-600 mt-2">Practice coding problems to improve your skills</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problems..."
                className="w-full"
              />
            </div>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="NOT_ATTEMPTED">Not Attempted</option>
            </select>
          </div>

          <Button type="submit" variant="ghost">
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {problems?.map((problem: any) => (
          <div key={problem.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {problem.title}
                  </Link>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    problem.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    problem.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficultyLevel}
                  </span>

                  {problem.userProgress && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      problem.userProgress.solved
                        ? 'bg-green-100 text-green-800'
                        : problem.userProgress.attempts > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {problem.userProgress.solved
                        ? '✅ Solved'
                        : problem.userProgress.attempts > 0
                        ? `${problem.userProgress.attempts} attempts`
                        : 'New'
                      }
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mt-2 line-clamp-2">{problem.description}</p>

                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  {problem.topic && (
                    <span>Topic: {problem.topic.name}</span>
                  )}
                  {problem.userProgress?.bestScore !== undefined && (
                    <span>Best Score: {problem.userProgress.bestScore}/{problem.testCasesCount}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <Link
                  to={`/problems/${problem.id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  {problem.userProgress?.solved ? 'Review' : 'Solve'}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {problems?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Filter size={48} className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};