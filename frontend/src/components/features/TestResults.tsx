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
    attemptId: string;
    // isCustomRun?: boolean;
  };
  onClose: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ result, onClose }) => {
  const passedTests = result.testResults?.filter(t => t.passed).length || 0;
  const totalTests = result.testResults?.length || 0;

  // Handle simple execution results (when just running code)
  // if (result.isCustomRun && !result.testResults) {
  //   return (
  //     <div className="bg-slate-800 rounded-lg border border-slate-600">
  //       <div className="p-4 border-b border-slate-600">
  //         <div className="flex items-center justify-between">
  //           <h3 className="text-lg font-semibold flex items-center text-white">
  //             <Clock className="text-blue-400 mr-2" size={20} />
  //             Execution Result
  //           </h3>
  //           <button
  //             onClick={onClose}
  //             className="text-gray-400 hover:text-white"
  //           >
  //             <X size={20} />
  //           </button>
  //         </div>
          
  //         <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
  //           <span className="flex items-center">
  //             <Clock size={14} className="mr-1" />
  //             {result.executionTime}ms
  //           </span>
  //         </div>
  //       </div>

  //       <div className="p-4">
  //         <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
  //           <h4 className="font-medium text-gray-300 mb-2">Output:</h4>
  //           <pre className="text-sm text-green-400 font-mono bg-slate-900 p-3 rounded border border-slate-600 whitespace-pre-wrap">
  //             {result.output?.join('\n') || 'No output'}
  //           </pre>
            
  //           {result.error && (
  //             <div className="mt-3">
  //               <h4 className="font-medium text-red-400 mb-2 flex items-center">
  //                 <AlertCircle size={14} className="mr-1" />
  //                 Error:
  //               </h4>
  //               <pre className="text-sm text-red-400 font-mono bg-slate-900 p-3 rounded border border-red-800">
  //                 {result.error}
  //               </pre>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center text-white">
            {result.success ? (
              <CheckCircle className="text-green-400 mr-2" size={20} />
            ) : (
              <XCircle className="text-red-400 mr-2" size={20} />
            )}
            Test Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
          <span className={passedTests === totalTests ? 'text-green-400' : 'text-red-400'}>
            {passedTests}/{totalTests} tests passed
          </span>
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {result.executionTime}ms
          </span>
        </div>
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
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
      </div>
    </div>
  );
};