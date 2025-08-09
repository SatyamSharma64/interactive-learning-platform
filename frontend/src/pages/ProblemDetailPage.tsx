import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { CodeEditor } from '../components/features/CodeEditor';
import { TestResults } from '../components/features/TestResults';
import { AIFeedback } from '../components/features/AIFeedback';
import { CodeVisualizer } from '../components/features/CodeVisualizer';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Send,
  Lightbulb,
  BarChart3,
  Settings,
  Maximize2
} from 'lucide-react';

type TabType = 'description' | 'editorial' | 'solutions' | 'submissions';
type BottomPanelTab = 'testcase' | 'result' | 'hints' | 'feedback';

export const ProblemDetailPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('testcase');
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [customTestInput, setCustomTestInput] = useState('');

  console.log('Problem ID:', problemId);
  const { on, off } = useWebSocket();

  const { data: problem, isLoading } = trpc.problems.getById.useQuery(
    { id: problemId! },
    { enabled: !!problemId }
  );

  const { data: userProgress } = trpc.problems.getUserProgress.useQuery(
    { problemId: problemId! },
    { enabled: !!problemId }
  );

  const submitSolution = trpc.problems.submitSolution.useMutation({
    onSuccess: (result) => {
      setSubmissionResult(result);
      setIsExecuting(false);
      setActiveBottomTab('result');
      setIsBottomPanelExpanded(true);
    },
    onError: (error) => {
      alert('Submission failed: ' + error.message);
      setIsExecuting(false);
    },
  });

  const hintQuery = trpc.problems.getHint.useQuery(
    { problemId: problemId! },
    { enabled: false }
  );

  // Initialize custom test input with sample input
  useEffect(() => {
    if (problem?.sampleInput && !customTestInput) {
      setCustomTestInput(problem.sampleInput);
    }
  }, [problem?.sampleInput, customTestInput]);

  // WebSocket event handlers
  useEffect(() => {
    const handleExecutionStarted = (data: { requestId: string }) => {
      setIsExecuting(true);
      setExecutionProgress('Starting code execution...');
    };

    const handleExecutionProgress = (data: { requestId: string; stage: string }) => {
      setExecutionProgress(data.stage);
    };

    const handleExecutionCompleted = (data: { requestId: string; result: any }) => {
      setIsExecuting(false);
      setExecutionProgress('');
    };

    const handleAnalysisCompleted = (data: { attemptId: string; analysis: any }) => {
      setSubmissionResult((prev: any) => prev ? { ...prev, aiAnalysis: data.analysis } : null);
      if (data.analysis) {
        setActiveBottomTab('feedback');
      }
    };

    on('execution:started', handleExecutionStarted);
    on('execution:progress', handleExecutionProgress);
    on('execution:completed', handleExecutionCompleted);
    on('analysis:completed', handleAnalysisCompleted);

    return () => {
      off('execution:started', handleExecutionStarted);
      off('execution:progress', handleExecutionProgress);
      off('execution:completed', handleExecutionCompleted);
      off('analysis:completed', handleAnalysisCompleted);
    };
  }, [on, off]);

  const handleSubmit = () => {
    if (!code.trim()) {
      alert('Please enter your solution code');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress('Submitting solution...');
    
    submitSolution.mutate({
      problemId: problemId!,
      code,
      language,
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      alert('Please enter your code to run');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress('Running code...');
    setActiveBottomTab('result');
    setIsBottomPanelExpanded(true);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          code,
          language,
          input: customTestInput || problem?.sampleInput || '',
          timeLimit: 5000,
          memoryLimit: 128,
        }),
      });
      
      const result = await response.json();
      console.log('Execution result:', result);
      setSubmissionResult({ ...result, isCustomRun: true });
    } catch (error) {
      console.error('Code execution failed:', error);
      alert('Code execution failed. Please try again.');
    } finally {
      setIsExecuting(false);
      setExecutionProgress('');
    }
  };

  const handleGetHint = () => {
    hintQuery.refetch();
    setActiveBottomTab('hints');
    setIsBottomPanelExpanded(true);
  };

  const toggleVisualizer = () => {
    setShowVisualizer(!showVisualizer);
    if (!showVisualizer) {
      setActiveTab('description');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12 bg-slate-900 text-white min-h-screen">
        <h2 className="text-2xl font-bold">Problem not found</h2>
      </div>
    );
  }

  const renderProblemDescription = () => (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                problem.difficultyLevel === 'BEGINNER' ? 'bg-green-500 text-green-900' :
                problem.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-500 text-yellow-900' :
                'bg-red-500 text-red-900'
              }`}>
                {problem.difficultyLevel}
              </span>
              {userProgress && (
                <span className="text-sm text-gray-400">
                  {userProgress.solved ? '✅ Solved' : `${userProgress.attempts} attempts`}
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={toggleVisualizer}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <BarChart3 size={16} className="mr-2" />
            {showVisualizer ? 'Hide' : 'Show'} Visualizer
          </Button>
        </div>
        
        <div className="prose prose-invert max-w-none mb-6">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {problem.description}
          </div>
        </div>

        {/* Examples */}
        {(problem.sampleInput || problem.sampleOutput) && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white">Examples</h3>
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Example 1:</h4>
              {problem.sampleInput && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-300">Input: </span>
                  <code className="text-sm text-blue-400 font-mono">{problem.sampleInput}</code>
                </div>
              )}
              {problem.sampleOutput && (
                <div>
                  <span className="text-sm font-medium text-gray-300">Output: </span>
                  <code className="text-sm text-green-400 font-mono">{problem.sampleOutput}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {problem.constraints && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {problem.constraints}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVisualizer = () => (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Code Visualization</h2>
          <Button
            onClick={toggleVisualizer}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <Eye size={16} className="mr-2" />
            Back to Description
          </Button>
        </div>
        <CodeVisualizer
          code={code}
          language={language}
          input={customTestInput || problem.sampleInput || ''}
        />
      </div>
    </div>
  );

  const renderBottomPanel = () => {
    if (!isBottomPanelExpanded) return null;

    return (
      <div className="h-80 bg-slate-900 border-t border-slate-700">
        {/* Tab Header */}
        <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveBottomTab('testcase')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeBottomTab === 'testcase' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Testcase
            </button>
            <button
              onClick={() => setActiveBottomTab('result')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeBottomTab === 'result' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Test Result
            </button>
            <button
              onClick={() => setActiveBottomTab('hints')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeBottomTab === 'hints' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Hints
            </button>
            <button
              onClick={() => setActiveBottomTab('feedback')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeBottomTab === 'feedback' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Feedback
            </button>
          </div>
          <button
            onClick={() => setIsBottomPanelExpanded(false)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Tab Content */}
        <div className="h-full overflow-y-auto p-4">
          {activeBottomTab === 'testcase' && (
            <div>
              <h3 className="text-white font-medium mb-2">Custom Test Input</h3>
              <textarea
                value={customTestInput}
                onChange={(e) => setCustomTestInput(e.target.value)}
                className="w-full h-32 bg-slate-800 border border-slate-600 rounded p-3 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your test input..."
              />
            </div>
          )}

          {activeBottomTab === 'result' && (
            <div>
              {submissionResult ? (
                <TestResults
                  result={submissionResult}
                  onClose={() => setSubmissionResult(null)}
                />
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No test results yet. Run your code to see results.
                </div>
              )}
            </div>
          )}

          {activeBottomTab === 'hints' && (
            <div>
              {hintQuery.data ? (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                    <Lightbulb size={16} className="mr-2" />
                    Hint (Attempt #{hintQuery.data.attemptNumber})
                  </h4>
                  <p className="text-blue-200 text-sm leading-relaxed">{hintQuery.data.hint}</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Click "Get Hint" to receive a helpful tip for solving this problem.</p>
                </div>
              )}
            </div>
          )}

          {activeBottomTab === 'feedback' && (
            <div>
              {submissionResult?.aiAnalysis ? (
                <AIFeedback
                  analysis={submissionResult.aiAnalysis}
                  attemptNumber={submissionResult.attemptNumber}
                />
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Submit your solution to receive AI-powered feedback and suggestions.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              {problem.title}
            </h1>
            {isExecuting && executionProgress && (
              <div className="flex items-center text-sm text-blue-400">
                <Loader2 size={16} className="mr-2 animate-spin" />
                {executionProgress}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-slate-900 border-r border-slate-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex-shrink-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  activeTab === 'description' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('editorial')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  activeTab === 'editorial' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Editorial
              </button>
              <button
                onClick={() => setActiveTab('solutions')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  activeTab === 'solutions' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Solutions
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'description' && !showVisualizer && renderProblemDescription()}
            {showVisualizer && renderVisualizer()}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-4">
              <h3 className="text-sm font-medium text-white">Code</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-slate-700"
              >
                {isBottomPanelExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </Button>
            </div>
          </div>

          {/* Code Editor Container */}
          <div className={`flex flex-col ${isBottomPanelExpanded ? 'flex-1' : 'flex-1'} min-h-0`}>
            {/* Code Editor */}
            <div className={`${isBottomPanelExpanded ? 'flex-1' : 'flex-1'} min-h-0`}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="100%"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRunCode}
                    variant="outline"
                    size="sm"
                    disabled={isExecuting}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Play size={16} className="mr-2" />
                    {isExecuting ? 'Running...' : 'Run'}
                  </Button>
                  <Button
                    onClick={handleGetHint}
                    variant="outline"
                    size="sm"
                    disabled={isExecuting}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Lightbulb size={16} className="mr-2" />
                    Hint
                  </Button>
                </div>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Send size={16} className="mr-2" />
                  {submitSolution.isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>

            {/* Bottom Panel */}
            {isBottomPanelExpanded && (
              <div className="h-80 bg-slate-900 border-t border-slate-700 flex-shrink-0">
                {/* Tab Header */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700 flex-shrink-0">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setActiveBottomTab('testcase')}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeBottomTab === 'testcase' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Testcase
                      </button>
                      <button
                        onClick={() => setActiveBottomTab('result')}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeBottomTab === 'result' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Test Result
                      </button>
                      <button
                        onClick={() => setActiveBottomTab('hints')}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeBottomTab === 'hints' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Hints
                      </button>
                      <button
                        onClick={() => setActiveBottomTab('feedback')}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeBottomTab === 'feedback' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        AI Feedback
                      </button>
                    </div>
                    <button
                      onClick={() => setIsBottomPanelExpanded(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {activeBottomTab === 'testcase' && (
                      <div>
                        <h3 className="text-white font-medium mb-2">Custom Test Input</h3>
                        <textarea
                          value={customTestInput}
                          onChange={(e) => setCustomTestInput(e.target.value)}
                          className="w-full h-40 bg-slate-800 border border-slate-600 rounded p-3 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your test input..."
                        />
                      </div>
                    )}

                    {activeBottomTab === 'result' && (
                      <div>
                        {submissionResult ? (
                          <TestResults
                            result={submissionResult}
                            onClose={() => setSubmissionResult(null)}
                          />
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            No test results yet. Run your code to see results.
                          </div>
                        )}
                      </div>
                    )}

                    {activeBottomTab === 'hints' && (
                      <div>
                        {hintQuery.data ? (
                          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                            <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                              <Lightbulb size={16} className="mr-2" />
                              Hint (Attempt #{hintQuery.data.attemptNumber})
                            </h4>
                            <p className="text-blue-200 text-sm leading-relaxed">{hintQuery.data.hint}</p>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Click "Get Hint" to receive a helpful tip for solving this problem.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeBottomTab === 'feedback' && (
                      <div>
                        {submissionResult?.aiAnalysis ? (
                          <AIFeedback
                            analysis={submissionResult.aiAnalysis}
                            attemptNumber={submissionResult.attemptNumber}
                          />
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Submit your solution to receive AI-powered feedback and suggestions.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};