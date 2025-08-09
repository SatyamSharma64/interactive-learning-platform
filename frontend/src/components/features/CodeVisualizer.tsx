import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, SkipForward, RotateCcw, Loader2 } from 'lucide-react';

interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, any>;
  output?: string;
  callStack: string[];
  description: string;
  stepNumber: number;
}

interface CodeVisualizerProps {
  code: string;
  language: string;
  input?: string;
}

export const CodeVisualizer: React.FC<CodeVisualizerProps> = ({
  code,
  language,
  input = '',
}) => {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);

  const generateExecutionSteps = async () => {
    setIsGeneratingSteps(true);
    try {
      const response = await fetch('/api/visualizer/trace', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ code, language, input }),
      });
      
      const data = await response.json();
      if (data.steps) {
        setExecutionSteps(data.steps);
        setCurrentStep(0);
      } else {
        throw new Error('Failed to generate execution trace');
      }
    } catch (error) {
      console.error('Failed to generate execution steps:', error);
      alert('Failed to generate code visualization. Please try again.');
    } finally {
      setIsGeneratingSteps(false);
    }
  };

  const playExecution = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= executionSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          setPlaybackInterval(null);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);
    
    setPlaybackInterval(interval);
  };

  const pauseExecution = () => {
    setIsPlaying(false);
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
  };

  const stepForward = () => {
    if (isPlaying) pauseExecution();
    setCurrentStep(prev => Math.min(prev + 1, executionSteps.length - 1));
  };

  const stepBackward = () => {
    if (isPlaying) pauseExecution();
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const resetExecution = () => {
    pauseExecution();
    setCurrentStep(0);
  };

  const currentStepData = executionSteps[currentStep];

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Code Execution Visualizer</h3>
          <div className="flex items-center space-x-3">
            {executionSteps.length > 0 && (
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
              </select>
            )}
            
            {executionSteps.length === 0 ? (
              <Button
                onClick={generateExecutionSteps}
                // isLoading={isGeneratingSteps}
                variant="ghost"
                size="sm"
              >
                {isGeneratingSteps ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Trace'
                )}
              </Button>
            ) : (
              <div className="flex items-center space-x-1">
                <Button size="sm" onClick={resetExecution} variant="outline">
                  <RotateCcw size={16} />
                </Button>
                <Button size="sm" onClick={stepBackward} variant="outline">
                  ←
                </Button>
                {isPlaying ? (
                  <Button size="sm" onClick={pauseExecution} variant="outline">
                    <Pause size={16} />
                  </Button>
                ) : (
                  <Button size="sm" onClick={playExecution} variant="outline">
                    <Play size={16} />
                  </Button>
                )}
                <Button size="sm" onClick={stepForward} variant="outline">
                  <SkipForward size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {executionSteps.length > 0 ? (
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Display */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Code</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                {code.split('\n').map((line, index) => (
                  <div
                    key={index}
                    className={`flex px-2 py-1 rounded ${
                      currentStepData?.lineNumber === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-gray-400 mr-4 select-none min-w-[2rem] text-right">
                      {(index + 1).toString()}
                    </span>
                    <span className="flex-1">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variables and State */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Variables</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {currentStepData?.variables && Object.keys(currentStepData.variables).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(currentStepData.variables).map(([name, value]) => (
                        <div key={name} className="flex justify-between items-center">
                          <span className="font-mono text-sm text-blue-600 font-medium">{name}</span>
                          <span className="font-mono text-sm bg-white px-2 py-1 rounded border max-w-32 truncate">
                            {typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No variables in current scope</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Call Stack</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {currentStepData?.callStack && currentStepData.callStack.length > 0 ? (
                    <div className="space-y-1">
                      {currentStepData.callStack.map((call, index) => (
                        <div key={index} className="font-mono text-sm bg-white px-2 py-1 rounded">
                          {call}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No function calls</p>
                  )}
                </div>
              </div>

              {currentStepData?.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Step</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">{currentStepData.description}</p>
                  </div>
                </div>
              )}

              {currentStepData?.output && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Output</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <pre className="text-sm text-green-800 font-mono whitespace-pre-wrap">
                      {currentStepData.output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {executionSteps.length}</span>
              <span>Line {currentStepData?.lineNumber || '-'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / executionSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <Play size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Execution Trace</h3>
            <p className="text-sm">Click "Generate Trace" to visualize your code execution step by step.</p>
          </div>
        </div>
      )}
    </div>
  );
};