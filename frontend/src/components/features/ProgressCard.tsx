import React from 'react';

interface ProgressCardProps {
  title: string;
  value: number;
  total?: number;
  unit?: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
  icon: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  total,
  unit,
  color,
  icon,
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  const progressColorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">
              {value}
              {total && <span className="text-lg">/{total}</span>}
            </p>
            {unit && <span className="ml-1 text-sm opacity-75">{unit}</span>}
          </div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>

      {total && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs opacity-75 mb-1">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div
              className={`${progressColorClasses[color]} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};