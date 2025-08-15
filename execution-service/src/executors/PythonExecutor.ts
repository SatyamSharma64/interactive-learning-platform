import { BaseExecutor, type ExecutionRequest, type ExecutionResult } from './BaseExecutor.js';

export class PythonExecutor extends BaseExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    
    // const fullScript = this.buildExecutionScript(request);
    console.log('Executing Python script:', request.code);
    // Use base64 encoding to safely pass the script to Docker
    const encodedScript = Buffer.from(request.code).toString('base64');
    
    let command: string;
    
    if (request.input && request.input.trim()) {
      // If input is provided, create a command that pipes input to the Python script
      const encodedInput = Buffer.from(request.input).toString('base64');
      command = `echo '${encodedScript}' | base64 -d > /tmp/solution.py && echo '${encodedInput}' | base64 -d | python /tmp/solution.py`;
    } else {
      // If no input provided, create a script that doesn't expect input
      const modifiedCode = this.wrapCodeForNoInput(request.code);
      const encodedModifiedScript = Buffer.from(modifiedCode).toString('base64');
      command = `echo '${encodedModifiedScript}' | base64 -d > /tmp/solution.py && python /tmp/solution.py`;
    }

    return await this.runInContainer(
      'python:3.12-slim',
      command,
      request.input,
      request.timeLimit,
      request.memoryLimit
    );
  }

private wrapCodeForNoInput(code: string): string {
    // Check if the code expects input
    if (code.includes('input()') && !code.includes('# Test case')) {
      // Wrap the code to provide default test input
      return `
# Wrapped version with test input
import sys
from io import StringIO

# Mock input for testing
test_input = """2 7 11 15
9"""

sys.stdin = StringIO(test_input)

${code}
`;
    }
    return code;
  }
}

//   private buildExecutionScript(request: ExecutionRequest): string {
//     // Get the template for this problem (this would come from your database)
//     const template = this.getTemplateForRequest(request);
    
//     if (template) {
//       // Use the template-based approach
//       return this.buildTemplatedScript(request, template);
//     } else {
//       // Fallback to generic execution
//       return this.buildGenericScript(request);
//     }
//   }

//   private buildTemplatedScript(request: ExecutionRequest, template: CodeTemplate): string {
//     const parts = [
//       template.imports || '',
//       '',
//       template.helperCode || '',
//       '',
//       request.code,
//       '',
//       template.inputParser,
//       '',
//       template.outputFormatter,
//       '',
//       template.mainFunction,
//       '',
//       template.testRunnerCode
//     ];

//     return parts.filter(part => part.trim()).join('\n');
//   }

//   private buildGenericScript(request: ExecutionRequest): string {
//     // Safe string building without template literals that cause escaping issues
//     const imports = [
//       'import sys',
//       'import json',
//       'from typing import List, Optional, Any',
//       ''
//     ].join('\n');

//     const userCode = request.code + '\n';

//     const mainFunction = `
// def main():
//     """Generic main execution - tries to detect and call the main function"""
//     try:
//         input_data = sys.stdin.read().strip()
//         if not input_data:
//             print("No input provided")
//             return
        
//         # Try to find the main function in the user's code
//         globals_dict = globals()
        
//         # Look for common function names or the first defined function
//         function_candidates = []
//         for name, obj in globals_dict.items():
//             if callable(obj) and not name.startswith('__') and name != 'main':
//                 function_candidates.append((name, obj))
        
//         if not function_candidates:
//             # If no function found, just execute the code as a script
//             print("No callable function found, executing as script")
//             return
        
//         # Use the first function found
//         func_name, func = function_candidates[0]
//         print(f"Found function: {func_name}")
        
//         # Try to parse input and call the function
//         lines = input_data.strip().split('\\n')
        
//         # Simple heuristic-based parsing
//         test_cases = []
//         if len(lines) == 1:
//             # Single line input
//             parts = lines[0].split()
//             if len(parts) == 1:
//                 try:
//                     # Try as integer first
//                     test_cases = [(int(parts[0]),)]
//                 except ValueError:
//                     # Fall back to string
//                     test_cases = [(parts[0],)]
//             else:
//                 # Multiple values - try as integer array
//                 try:
//                     nums = list(map(int, parts))
//                     test_cases = [(nums,)]
//                 except ValueError:
//                     # Fall back to string array
//                     test_cases = [(parts,)]
//         else:
//             # Multi-line input - try to pair lines as parameters
//             i = 0
//             while i < len(lines):
//                 if i + 1 < len(lines):
//                     # Try parsing as array + target pattern (common pattern)
//                     try:
//                         param1 = list(map(int, lines[i].split()))
//                         param2 = int(lines[i + 1])
//                         test_cases.append((param1, param2))
//                         i += 2
//                     except ValueError:
//                         # Not numeric, treat as strings
//                         test_cases.append((lines[i].strip(), lines[i + 1].strip()))
//                         i += 2
//                 else:
//                     # Single remaining line
//                     try:
//                         test_cases.append((int(lines[i]),))
//                     except ValueError:
//                         test_cases.append((lines[i].strip(),))
//                     i += 1
        
//         # Execute test cases
//         for i, params in enumerate(test_cases):
//             try:
//                 result = func(*params)
//                 if isinstance(result, list):
//                     print(f"Test case {i + 1}: {json.dumps(result)}")
//                 elif isinstance(result, bool):
//                     print(f"Test case {i + 1}: {str(result).lower()}")
//                 else:
//                     print(f"Test case {i + 1}: {result}")
//             except Exception as e:
//                 print(f"Error in test case {i + 1}: {str(e)}")
//                 import traceback
//                 traceback.print_exc()
        
//         print(f"\\nExecuted {len(test_cases)} test cases using function '{func_name}'")
        
//     except Exception as e:
//         print(f"Execution error: {str(e)}")
//         import traceback
//         traceback.print_exc()
// `;

//     const runner = `
// if __name__ == "__main__":
//     main()
// `;

//     return imports + userCode + mainFunction + runner;
//   }

//   private getTemplateForRequest(request: ExecutionRequest): CodeTemplate | null {
//     // This would typically fetch from your database based on problemId
//     // For now, return null to use generic execution
    
//     // Example implementation:
//     // if (request.codeTemplate) {
//     //   return request.codeTemplate;
//     // }
    
//     return null; // Use generic execution for now
//   }
// }

// interface CodeTemplate {
//   id: string;
//   problemId: string;
//   languageId: string;
//   templateCode: string;
//   starterCode?: string;
//   helperCode?: string;
//   imports?: string;
//   mainFunction: string;
//   testRunnerCode: string;
//   inputParser: string;
//   outputFormatter: string;
//   functionName: string;
//   parameterTypes: ParameterType[];
// }

// interface ParameterType {
//   name: string;
//   type: 'int' | 'float' | 'string' | 'list_int' | 'list_float' | 'list_string' | 'matrix_int' | 'custom';
//   description: string;
//   parser?: string;
// }