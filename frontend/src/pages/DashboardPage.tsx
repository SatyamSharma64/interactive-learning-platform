import React from 'react';
import { trpc } from '../lib/trpc';
import { useAuthStore } from '../store/authStore';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  const { data: userStats, isLoading } = trpc.dashboard.getUserStats.useQuery();
  const { data: recentActivity } = trpc.dashboard.getRecentActivity.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg p-6
                      dark:from-gray-200 dark:to-gray-400">
          <h1 className="text-white font-bold text-2xl
                        dark:text-gray-800">
              Welcome back, {user?.firstName || user?.username}! 👨‍💻
          </h1>
          <p className="text-gray-300 mt-1
                        dark:text-gray-700">
              Ready to continue your coding journey?
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Problems Solved</p>
              <p className="text-2xl font-semibold text-green-900">
                {userStats?.problemsSolved || 0}/{userStats?.totalProblems || 0}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Success Rate</p>
              <p className="text-2xl font-semibold text-orange-900">
                {userStats?.successRate || 0}%
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Current Streak</p>
              <p className="text-2xl font-semibold text-blue-900">
                {userStats?.currentStreak || 0} days
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Time Coding</p>
              <p className="text-2xl font-semibold text-purple-900">
                {userStats?.totalTimeSpent || 0}h
              </p>
            </div>
            <div className="text-2xl">⏱️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">
                      {activity.status === 'ACCEPTED' ? '✅ Solved' : '❌ Failed'} • {activity.details.language}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="font-medium text-blue-900">Continue Learning</div>
              <div className="text-sm text-blue-700">Pick up where you left off</div>
            </button>
            <button className="w-full p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <div className="font-medium text-green-900">Practice Problems</div>
              <div className="text-sm text-green-700">Solve coding challenges</div>
            </button>
            <button className="w-full p-3 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="font-medium text-purple-900">View Progress</div>
              <div className="text-sm text-purple-700">Check your learning stats</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};