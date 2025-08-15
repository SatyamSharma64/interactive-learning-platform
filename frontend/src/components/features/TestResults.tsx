import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  errors?: string[];
}

interface TestResultsProps {
  result: {
    success: boolean;
    testResults: TestResult[];
    executionTime: number;
    attemptId?: string;
    isCustomRun?: boolean;
  };
  onClose: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ result, onClose }) => {
  const passedTests = result.testResults?.filter(t => t.passed).length || 0;
  const totalTests = result.testResults?.length || 0;
  const allTestsPassed = passedTests === totalTests && totalTests > 0;
  
  // Find the first failed test case for submission view
  const firstFailedTestIndex = result.testResults?.findIndex(t => !t.passed) ?? -1;
  
  console.log('Test Results:', result);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center text-white">
            {allTestsPassed ? (
              <CheckCircle className="text-green-400 mr-2" size={20} />
            ) : (
              <XCircle className="text-red-400 mr-2" size={20} />
            )}
            {result.isCustomRun ? 'Test Results' : 'Submission Results'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
          <span className={allTestsPassed ? 'text-green-400' : 'text-red-400'}>
            {passedTests}/{totalTests} tests passed
          </span>
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {result.executionTime}ms
          </span>
        </div>
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        {result.isCustomRun ? (
          // Custom Run: Show all test results
          <div className="space-y-4">
            {result.testResults?.map((test, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${
                  test.passed 
                    ? 'border-green-600 bg-green-900/20' 
                    : 'border-red-600 bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-white">
                    Test Case {index + 1}
                  </span>
                  <div className="flex items-center">
                    {test.passed ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <XCircle size={16} className="text-red-400" />
                    )}
                    <span className="ml-1 text-xs text-gray-400">
                      {test.executionTime}ms
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-300">Input:</span>
                    <pre className="mt-1 p-2 bg-slate-900 border border-slate-600 rounded font-mono text-gray-300">
                      {test.input || '(no input)'}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-300">Expected:</span>
                      <pre className="mt-1 p-2 bg-slate-900 border border-slate-600 rounded font-mono text-blue-400">
                        {test.expectedOutput}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-300">Your Output:</span>
                      <pre className={`mt-1 p-2 rounded font-mono border ${
                        test.passed 
                          ? 'bg-green-900/30 border-green-600 text-green-400' 
                          : 'bg-red-900/30 border-red-600 text-red-400'
                      }`}>
                        {test.actualOutput}
                      </pre>
                    </div>
                  </div>

                  {test.errors && test.errors.length > 0 && (
                    <div>
                      <span className="font-medium text-red-400 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        Errors:
                      </span>
                      <div className="mt-1 p-2 bg-red-900/30 border border-red-600 rounded">
                        {test.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="text-red-300 font-mono text-xs">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )) || (
              <div className="text-gray-400 text-center py-4">
                No test results available
              </div>
            )}
          </div>
        ) : (
          // Submission: Show either success message or first failed test case
          <div className="space-y-4">
            {allTestsPassed ? (
              // All tests passed - show success message
              <div className="border border-green-600 bg-green-900/20 rounded-lg p-4 text-center">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-400 mb-2">
                  Accepted
                </h4>
                <p className="text-gray-300 text-sm">
                  Your solution passed all {totalTests} test cases!
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Runtime: {result.executionTime}ms
                </div>
              </div>
            ) : (
              // Some tests failed - show the first failed test case
              firstFailedTestIndex >= 0 && (
                <div className="space-y-3">
                  <div className="border border-red-600 bg-red-900/20 rounded-lg p-4 text-center">
                    <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-red-400 mb-2">
                      Wrong Answer
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Failed on test case {firstFailedTestIndex + 1} of {totalTests}
                    </p>
                  </div>

                  {/* Show the failed test case details */}
                  {(() => {
                    const failedTest = result.testResults[firstFailedTestIndex];
                    return (
                      <div className="border border-red-600 bg-red-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-white">
                            Failed Test Case
                          </span>
                          <div className="flex items-center">
                            <XCircle size={16} className="text-red-400" />
                            <span className="ml-1 text-xs text-gray-400">
                              {failedTest.executionTime}ms
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-medium text-gray-300">Input:</span>
                            <pre className="mt-1 p-2 bg-slate-900 border border-slate-600 rounded font-mono text-gray-300">
                              {failedTest.input || '(no input)'}
                            </pre>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-gray-300">Expected:</span>
                              <pre className="mt-1 p-2 bg-slate-900 border border-slate-600 rounded font-mono text-blue-400">
                                {failedTest.expectedOutput}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300">Your Output:</span>
                              <pre className="mt-1 p-2 bg-red-900/30 border border-red-600 rounded font-mono text-red-400">
                                {failedTest.actualOutput}
                              </pre>
                            </div>
                          </div>

                          {failedTest.errors && failedTest.errors.length > 0 && (
                            <div>
                              <span className="font-medium text-red-400 flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                Errors:
                              </span>
                              <div className="mt-1 p-2 bg-red-900/30 border border-red-600 rounded">
                                {failedTest.errors.map((error, errorIndex) => (
                                  <div key={errorIndex} className="text-red-300 font-mono text-xs">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};