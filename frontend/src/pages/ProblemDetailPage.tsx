import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { CodeEditor } from '../components/features/MonacoCodeEditor';
import { TestResults } from '../components/features/TestResults';
import { AIFeedback } from '../components/features/AIFeedback';
import { CodeVisualizer } from '../components/features/CodeVisualizer';
// import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Send,
  Lightbulb,
  BarChart3,
  GripVertical,
  X,
  ArrowLeftFromLine
} from 'lucide-react';

type TabType = 'description' | 'editorial' | 'solutions' | 'submissions';
type BottomPanelTab = 'testcase' | 'result' | 'hints' | 'feedback';

// Custom hook for resizable panels
const useResizable = (
  initialSize: number,
  minSize: number = 200,
  maxSize: number = window.innerWidth - 200
) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startPos.current = e.clientX;
    startSize.current = size;
    e.preventDefault();
  }, [size]);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startPos.current;
    const newSize = Math.min(maxSize, Math.max(minSize, startSize.current + diff));
    setSize(newSize);
  }, [isResizing, minSize, maxSize]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResize]);

  return { size, startResize, isResizing };
};

// Custom hook for bottom panel resizing
const useBottomPanelResize = (initialHeight: number = 320) => {
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startHeight = useRef(0);

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startPos.current = e.clientY;
    startHeight.current = height;
    e.preventDefault();
  }, [height]);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const diff = startPos.current - e.clientY; // Inverted for bottom panel
    const newHeight = Math.min(600, Math.max(200, startHeight.current + diff));
    setHeight(newHeight);
  }, [isResizing]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResize]);

  return { height, startResize, isResizing };
};

export const ProblemDetailPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('testcase');
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [customTestInput, setCustomTestInput] = useState('');
  const navigate = useNavigate();

  // Resizable panels
  const leftPanel = useResizable(window.innerWidth * 0.5, 300, window.innerWidth - 300);
  const bottomPanel = useBottomPanelResize(320);

  console.log('Problem ID:', problemId);
  // const { on, off } = useWebSocket();

  const { data: problem, isLoading } = trpc.problems.getById.useQuery(
    { id: problemId! },
    { enabled: !!problemId }
  );

  const { data: userProgress } = trpc.problems.getUserProgress.useQuery(
    { problemId: problemId! },
    { enabled: !!problemId }
  );

  const { data: programmingLanguages } = trpc.problems.getAvailableProgrammingLanguages.useQuery();

  const { data: codeTemplate } = trpc.problems.getCodeTemplateById.useQuery(
    { 
      problemId: problemId!, 
      languageId: selectedLanguage?.id! 
    },
    { enabled: !!problemId && !!selectedLanguage?.id }
  );

  useEffect(() => {
    if (programmingLanguages && programmingLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(programmingLanguages[0]);
    }
  }, [programmingLanguages]);

  // Set code template when language changes or template loads
  useEffect(() => {
    if (codeTemplate?.templateCode && !code) {
      setCode(codeTemplate.templateCode);
    }
  }, [codeTemplate]);

  console.log('Code Template:', codeTemplate);
  console.log('Current Code:', code);

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

  const testCode = trpc.problems.testCode.useMutation({
    onSuccess: (result) => {
      setSubmissionResult({ ...result, isCustomRun: true });
      setIsExecuting(false);
      setActiveBottomTab('result');
      setIsBottomPanelExpanded(true);
    },
    onError: (error) => {
      alert('Code execution failed: ' + error.message);
      setIsExecuting(false);
    },
  });

  const hintQuery = trpc.problems.getHint.useQuery(
    { problemId: problemId! },
    { enabled: false }
  );

  const sampleTestCases = problem?.testCases?.filter((test: any) => test.isSample === true);

  // Initialize custom test input with sample input
  useEffect(() => {
    if (sampleTestCases && !customTestInput) {
      setCustomTestInput(sampleTestCases.map((test: any) => test.input).join('\n'));
    }
  }, [problem?.testCases, customTestInput]);

  // WebSocket event handlers
  // useEffect(() => {
  //   const handleExecutionStarted = (data: { requestId: string }) => {
  //     setIsExecuting(true);
  //     setExecutionProgress('Starting code execution...');
  //   };

  //   const handleExecutionProgress = (data: { requestId: string; stage: string }) => {
  //     setExecutionProgress(data.stage);
  //   };

  //   const handleExecutionCompleted = (data: { requestId: string; result: any }) => {
  //     setIsExecuting(false);
  //     setExecutionProgress('');
  //   };

  //   const handleAnalysisCompleted = (data: { attemptId: string; analysis: any }) => {
  //     setSubmissionResult((prev: any) => prev ? { ...prev, aiAnalysis: data.analysis } : null);
  //     if (data.analysis) {
  //       setActiveBottomTab('feedback');
  //     }
  //   };

  //   on('execution:started', handleExecutionStarted);
  //   on('execution:progress', handleExecutionProgress);
  //   on('execution:completed', handleExecutionCompleted);
  //   on('analysis:completed', handleAnalysisCompleted);

  //   return () => {
  //     off('execution:started', handleExecutionStarted);
  //     off('execution:progress', handleExecutionProgress);
  //     off('execution:completed', handleExecutionCompleted);
  //     off('analysis:completed', handleAnalysisCompleted);
  //   };
  // }, [on, off]);

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
      languageId: selectedLanguage?.id || 'python',
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      alert('Please enter your code to run');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress('Running code...');
    
    testCode.mutate({
      problemId: problemId!,
      code,
      languageId: selectedLanguage?.id || 'python',
    });
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

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = programmingLanguages?.find((lang: any) => lang.name === event.target.value);
    if (selectedLang) {
      setSelectedLanguage(selectedLang);
      // Reset code when language changes
      setCode('');
    }
  };

  // Reset to template functionality
  const resetToTemplate = () => {
    if (codeTemplate?.templateCode) {
      setCode(codeTemplate.templateCode);
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
                problem.difficultyLevel === 'easy' ? 'bg-green-500 text-green-900' :
                problem.difficultyLevel === 'medium' ? 'bg-yellow-500 text-yellow-900' :
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
        {sampleTestCases && sampleTestCases.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white">Examples</h3>
            {sampleTestCases.map((testCase: any, index: number) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Example {index + 1}:</h4>
                {testCase.input && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-300">Input: </span>
                    <code className="text-sm text-blue-400 font-mono">{testCase.input}</code>
                  </div>
                )}
                {testCase.expectedOutput && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-300">Output: </span>
                    <code className="text-sm text-green-400 font-mono">{testCase.expectedOutput}</code>
                  </div>
                )}
                {testCase.explanation && (
                  <div>
                    <span className="text-sm font-medium text-gray-300">Explanation: </span>
                    <span className="text-sm text-gray-300">{testCase.explanation}</span>
                  </div>
                )}
              </div>
            ))}
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

  // **Modified: New fullscreen visualizer render function**
  const renderFullscreenVisualizer = () => (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* **Added: Fullscreen visualizer header with close button** */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">Code Visualizer - {problem.title}</h1>
          </div>
          <Button
            onClick={() => setShowVisualizer(false)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <X size={16} className="mr-2" />
            Back to Description
          </Button>
        </div>
      </div>
      
      {/* **Modified: Fullscreen visualizer content** */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <CodeVisualizer
          problemId={problemId!}
          code={code}
          languageId={selectedLanguage?.Id || 'lang1'}
          input={customTestInput || ''}
        />
      </div>
    </div>
  );

  // const renderVisualizer = () => (
  //   <div className="h-full overflow-y-auto">
  //     <div className="p-4">
  //       <div className="flex items-center justify-between mb-4">
  //         <div className="flex items-center space-x-4">
  //           <h1 className="text-lg font-semibold text-white">Code Visualizer - {problem.title}</h1>
  //         </div>
  //         <Button
  //           onClick={() => setShowVisualizer(false)}
  //           variant="outline"
  //           size="sm"
  //           className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
  //         >
  //           <X size={16} className="mr-2" />
  //           Back to Description
  //         </Button>
  //       </div>
  //       <CodeVisualizer
  //         problemId={problemId!}
  //         code={code}
  //         languageId={selectedLanguage?.Id || 'lang1'}
  //         input={customTestInput || ''}
  //       />
  //     </div>
  //   </div>
  // );

  // **Added: Return fullscreen visualizer if showVisualizer is true**
  if (showVisualizer) {
    return renderFullscreenVisualizer();
  }

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
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <ArrowLeftFromLine size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Problem Description */}
        <div 
          className="bg-slate-900 border-r border-slate-700 flex flex-col"
          style={{ width: leftPanel.size }}
        >
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
            {/* **Modified: Removed showVisualizer condition from this render section** */}
            {/* {activeTab === 'description' && renderProblemDescription()} */}
            {renderProblemDescription()}
          </div>
        </div>

        {/* Vertical Resize Handle */}
        <div
          className={`w-2 bg-slate-700 hover:bg-slate-600 cursor-col-resize flex items-center justify-center group transition-colors ${
            leftPanel.isResizing ? 'bg-slate-600' : ''
          }`}
          onMouseDown={leftPanel.startResize}
        >
          <GripVertical 
            size={16} 
            className="text-slate-400 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-4">
              <h3 className="text-sm font-medium text-white">Code</h3>
              <select
                value={selectedLanguage?.name || 'python'}
                onChange={handleLanguageChange}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {programmingLanguages?.map((lang: any) => (
                  <option key={lang.id} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {codeTemplate?.templateCode && (
                <button
                  onClick={resetToTemplate}
                  className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                  title="Reset to template"
                >
                  Reset Template
                </button>
              )}
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
          <div 
            className="flex flex-col min-h-0"
            style={{ 
                height: isBottomPanelExpanded 
                  ? `calc(100% - ${bottomPanel.height + 8}px)`
                  : '100%'
              }}
          >
            {/* Code Editor */}
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage?.name || 'python'}
                height="100%"
                minimap={true}
                fontSize={14}
                theme="vs-dark"
                resetToTemplate={resetToTemplate}
                codeTemplate={codeTemplate}
              />
            </div>
          </div>

          {/* Bottom Panel */}
          {isBottomPanelExpanded && (
            <>
              {/* Horizontal Resize Handle */}
              <div
                className={`h-2 bg-slate-700 hover:bg-slate-600 cursor-row-resize flex items-center justify-center group transition-colors ${
                  bottomPanel.isResizing ? 'bg-slate-600' : ''
                }`}
                onMouseDown={bottomPanel.startResize}
              >
                <div className="w-12 h-1 bg-slate-500 group-hover:bg-slate-400 rounded transition-colors" />
              </div>
              
              <div 
                className="bg-slate-900 border-t border-slate-700 flex flex-col"
                style={{ height: bottomPanel.height }}
              >
                {/* Tab Header */}
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
            </>
          )}

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
        </div>
      </div>
    </div>
  );
};