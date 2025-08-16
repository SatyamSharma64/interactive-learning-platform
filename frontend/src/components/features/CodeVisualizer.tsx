import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Loader2, StepBack, FastForward, Bug, Variable, Eye } from 'lucide-react';

interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, any>;
  output?: string;
  callStack: string[];
  description: string;
  stepNumber: number;
  executionState?: 'running' | 'paused' | 'error' | 'completed';
  memorySnapshot?: Record<string, any>;
}

interface CodeVisualizerProps {
  problemId: string;
  code: string;
  languageId: string;
  input?: string;
}

export const CodeVisualizer: React.FC<CodeVisualizerProps> = ({
  problemId,
  code,
  languageId,
  input = '',
}) => {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [showCallStack, setShowCallStack] = useState(true);
  const [showVariables, setShowVariables] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  const generateExecutionSteps = async () => {
    setIsGeneratingSteps(true);
    try {
      const response = await fetch('/api/visualizer/trace', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ problemId, code, languageId, input }),
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
    if (isPlaying || currentStep >= executionSteps.length - 1) return;
    
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

  const jumpToStep = (step: number) => {
    if (isPlaying) pauseExecution();
    setCurrentStep(Math.max(0, Math.min(step, executionSteps.length - 1)));
  };

  // Auto-scroll to current line
  useEffect(() => {
    if (autoScroll && executionSteps.length > 0) {
      const currentLineElement = document.getElementById(`line-${executionSteps[currentStep]?.lineNumber}`);
      if (currentLineElement) {
        currentLineElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentStep, autoScroll, executionSteps]);

  const currentStepData = executionSteps[currentStep];

  const formatValue = (value: any): string => {
    if (typeof value === 'string') {
      return `"${value}"`;
    } else if (Array.isArray(value)) {
      return `[${value.slice(0, 5).map(formatValue).join(', ')}${value.length > 5 ? '...' : ''}]`;
    } else if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).slice(0, 3);
      const formatted = entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ');
      return `{${formatted}${Object.keys(value).length > 3 ? '...' : ''}}`;
    }
    return String(value);
  };

  const getStepStateColor = (state?: string) => {
    switch (state) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5 text-blue-600" />
            Code Execution Debugger
          </h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="mr-1"
              />
              Auto-scroll
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showVariables}
                onChange={(e) => setShowVariables(e.target.checked)}
                className="mr-1"
              />
              <Variable className="w-4 h-4 mr-1" />
              Variables
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showCallStack}
                onChange={(e) => setShowCallStack(e.target.checked)}
                className="mr-1"
              />
              <Eye className="w-4 h-4 mr-1" />
              Call Stack
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {executionSteps.length > 0 && (
              <>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                  <option value={100}>10x</option>
                </select>
                
                <div className="flex items-center space-x-1">
                  <Button size="sm" onClick={resetExecution} variant="outline" title="Reset">
                    <RotateCcw size={16} />
                  </Button>
                  <Button size="sm" onClick={stepBackward} variant="outline" title="Step Back">
                    <StepBack size={16} />
                  </Button>
                  {isPlaying ? (
                    <Button size="sm" onClick={pauseExecution} variant="outline" title="Pause">
                      <Pause size={16} />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={playExecution} variant="outline" title="Play">
                      <Play size={16} />
                    </Button>
                  )}
                  <Button size="sm" onClick={stepForward} variant="outline" title="Step Forward">
                    <SkipForward size={16} />
                  </Button>
                </div>
              </>
            )}
            
            {executionSteps.length === 0 && (
              <Button
                onClick={generateExecutionSteps}
                variant="default"
                disabled={isGeneratingSteps}
              >
                {isGeneratingSteps ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <Bug size={16} className="mr-2" />
                    Start Debugging
                  </>
                )}
              </Button>
            )}
          </div>

          {executionSteps.length > 0 && (
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {executionSteps.length} 
              {currentStepData && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getStepStateColor(currentStepData.executionState)}`}>
                  {currentStepData.executionState || 'running'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {executionSteps.length > 0 ? (
        <div className="p-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Code Display */}
            <div className="xl:col-span-2 space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                Code Execution
                <span className="text-xs text-gray-500">
                  {currentStepData && `Line ${currentStepData.lineNumber}`}
                </span>
              </h4>
              <div className="bg-gray-900 text-white rounded-lg font-mono text-sm overflow-hidden max-h-96 overflow-y-auto">
                {code.split('\n').map((line, index) => (
                  <div
                    key={index}
                    id={`line-${index + 1}`}
                    className={`flex px-3 py-1 ${
                      currentStepData?.lineNumber === index + 1
                        ? currentStepData.executionState === 'error' 
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800'
                    } cursor-pointer`}
                    onClick={() => {
                      // Find steps for this line
                      const stepsForLine = executionSteps.findIndex(step => step.lineNumber === index + 1);
                      if (stepsForLine !== -1) {
                        jumpToStep(stepsForLine);
                      }
                    }}
                  >
                    <span className="text-gray-400 mr-4 select-none min-w-[3rem] text-right">
                      {(index + 1).toString()}
                    </span>
                    <span className="flex-1">{line || ' '}</span>
                    {currentStepData?.lineNumber === index + 1 && (
                      <span className="ml-2 text-yellow-300">●</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Debug Panels */}
            <div className="space-y-4">
              {/* Variables Panel */}
              {showVariables && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Variable className="w-4 h-4" />
                    Variables
                    {currentStepData?.variables && (
                      <span className="text-xs text-gray-500">
                        ({Object.keys(currentStepData.variables).length})
                      </span>
                    )}
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {currentStepData?.variables && Object.keys(currentStepData.variables).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(currentStepData.variables).map(([name, value]) => (
                          <div 
                            key={name} 
                            className={`p-2 rounded border cursor-pointer transition-colors ${
                              selectedVariable === name 
                                ? 'bg-blue-100 border-blue-300' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedVariable(selectedVariable === name ? null : name)}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-sm text-blue-600 font-medium">{name}</span>
                              <span className="font-mono text-xs text-gray-500">
                                {typeof value === 'object' && value !== null ? 
                                  Array.isArray(value) ? 'array' : 'object' : 
                                  typeof value
                                }
                              </span>
                            </div>
                            <div className="font-mono text-sm text-gray-700 mt-1 break-all">
                              {formatValue(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No variables in current scope</p>
                    )}
                  </div>
                </div>
              )}

              {/* Call Stack Panel */}
              {showCallStack && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Call Stack
                    {currentStepData?.callStack && (
                      <span className="text-xs text-gray-500">
                        ({currentStepData.callStack.length})
                      </span>
                    )}
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    {currentStepData?.callStack && currentStepData.callStack.length > 0 ? (
                      <div className="space-y-1">
                        {currentStepData.callStack.map((call, index) => (
                          <div key={index} className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            <span className="text-gray-500 text-xs mr-2">{index + 1}.</span>
                            {call}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-2">No function calls</p>
                    )}
                  </div>
                </div>
              )}

              {/* Current Step Description */}
              {currentStepData?.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Step</h4>
                  <div className={`p-3 rounded-lg border ${getStepStateColor(currentStepData.executionState)}`}>
                    <p className="text-sm font-medium">{currentStepData.description}</p>
                  </div>
                </div>
              )}

              {/* Output Panel */}
              {currentStepData?.output && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Output</h4>
                  <div className={`p-3 rounded-lg ${
                    currentStepData.executionState === 'error' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <pre className={`text-sm font-mono whitespace-pre-wrap ${
                      currentStepData.executionState === 'error' 
                        ? 'text-red-800' 
                        : 'text-green-800'
                    }`}>
                      {currentStepData.output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar and Step Navigation */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {executionSteps.length}</span>
              <div className="flex items-center gap-4">
                <span>Line {currentStepData?.lineNumber || '-'}</span>
                {currentStepData?.executionState && (
                  <span className={`px-2 py-1 rounded text-xs ${getStepStateColor(currentStepData.executionState)}`}>
                    {currentStepData.executionState}
                  </span>
                )}
              </div>
            </div>
            
            {/* Interactive Progress Bar */}
            <div className="relative w-full bg-gray-200 rounded-full h-3 cursor-pointer" 
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = e.clientX - rect.left;
                   const percentage = x / rect.width;
                   const targetStep = Math.floor(percentage * executionSteps.length);
                   jumpToStep(targetStep);
                 }}>
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / executionSteps.length) * 100}%` }}
              />
              {/* Step markers */}
              {executionSteps.map((step, index) => (
                <div
                  key={index}
                  className={`absolute top-0 w-1 h-3 ${
                    step.executionState === 'error' ? 'bg-red-400' :
                    step.executionState === 'completed' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`}
                  style={{ left: `${(index / executionSteps.length) * 100}%` }}
                />
              ))}
            </div>
            
            {/* Step List for Navigation */}
            <div className="mt-4 max-h-32 overflow-y-auto">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Execution Steps:</h5>
              <div className="space-y-1">
                {executionSteps.slice(Math.max(0, currentStep - 2), currentStep + 3).map((step, index) => {
                  const stepIndex = Math.max(0, currentStep - 2) + index;
                  return (
                    <div
                      key={stepIndex}
                      className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                        stepIndex === currentStep
                          ? 'bg-blue-100 border border-blue-300 text-blue-800'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => jumpToStep(stepIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono">Step {stepIndex + 1}</span>
                        <span className="font-mono text-gray-500">Line {step.lineNumber}</span>
                      </div>
                      <div className="truncate mt-1">{step.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <Bug size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Debug</h3>
            <p className="text-sm mb-4">
              Click "Start Debugging" to begin step-by-step execution visualization.
            </p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg max-w-md mx-auto">
              <p className="font-medium mb-2">Features:</p>
              <ul className="space-y-1 text-left">
                <li>• Line-by-line execution tracking</li>
                <li>• Variable state monitoring</li>
                <li>• Call stack visualization</li>
                <li>• Interactive step navigation</li>
                <li>• Automatic output capture</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
