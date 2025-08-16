import { BaseExecutor, type ExecutionRequest, type ExecutionResult } from './BaseExecutor.js';

export class PythonExecutor extends BaseExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    console.log('Executing Python script:', request.code);
    
    // Create a more robust execution script
    const executionScript = this.buildExecutionScript(request);
    const encodedScript = Buffer.from(executionScript).toString('base64');
    
    let command: string;
    
    if (request.input && request.input.trim()) {
      const encodedInput = Buffer.from(request.input).toString('base64');
      command = `echo '${encodedScript}' | base64 -d > /tmp/solution.py && echo '${encodedInput}' | base64 -d | python /tmp/solution.py`;
    } else {
      command = `echo '${encodedScript}' | base64 -d > /tmp/solution.py && python /tmp/solution.py`;
    }

    return await this.runInContainer(
      'python:3.12-slim',
      command,
      request.input,
      request.timeLimit,
      request.memoryLimit
    );
  }

  private buildExecutionScript(request: ExecutionRequest): string {
    const { code, input = '' } = request;
    
    // Enhanced execution script with better error handling and debugging support
    return `
import sys
import traceback
import io
from contextlib import redirect_stdout, redirect_stderr
import json
import time
import gc

# Setup for enhanced execution
start_time = time.time()
output_buffer = io.StringIO()
error_buffer = io.StringIO()
execution_info = {
    'start_time': start_time,
    'success': False,
    'output': [],
    'errors': [],
    'execution_time': 0,
    'memory_usage': 0,
    'line_count': len('''${code.replace(/'/g, "\\'")}'''.split('\\n')),
    'has_input': ${input ? 'True' : 'False'}
}

def get_memory_usage():
    """Get current memory usage in MB"""
    try:
        import psutil
        import os
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
    except ImportError:
        # Fallback to gc stats if psutil is not available
        return len(gc.get_objects()) * 0.001  # Rough estimation

# Prepare input if provided
if execution_info['has_input']:
    sys.stdin = io.StringIO('''${input.replace(/'/g, "\\'")}''')

try:
    # Redirect stdout and stderr to capture all output
    with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
        # Execute the user code in a controlled environment
        user_globals = {
            '__name__': '__main__',
            '__builtins__': __builtins__,
        }
        
        # Add common imports that might be needed
        exec('''
import sys
import math
import random
import itertools
from collections import defaultdict, Counter, deque
import heapq
import bisect
''', user_globals)
        
        # Execute the actual user code
        exec('''${code.replace(/'/g, "\\'")}''', user_globals)
    
    # Capture successful execution
    execution_info['success'] = True
    output_content = output_buffer.getvalue()
    if output_content:
        execution_info['output'] = output_content.split('\\n')
    
except Exception as e:
    # Capture execution errors with detailed traceback
    execution_info['success'] = False
    error_content = error_buffer.getvalue()
    
    if error_content:
        execution_info['errors'].append(error_content)
    
    # Add formatted traceback
    tb_lines = traceback.format_exc().split('\\n')
    # Filter out internal execution lines
    filtered_tb = []
    for line in tb_lines:
        if 'exec(' not in line and '/tmp/solution.py' in line or 'Error:' in line or 'Exception:' in line:
            filtered_tb.append(line)
    
    if filtered_tb:
        execution_info['errors'].extend(filtered_tb)
    else:
        execution_info['errors'].append(f"{type(e).__name__}: {str(e)}")

except KeyboardInterrupt:
    execution_info['success'] = False
    execution_info['errors'].append('Execution interrupted (timeout or manual stop)')

except SystemExit as e:
    execution_info['success'] = e.code == 0
    if e.code != 0:
        execution_info['errors'].append(f'Program exited with code {e.code}')

finally:
    # Calculate execution metrics
    execution_info['execution_time'] = (time.time() - start_time) * 1000  # Convert to milliseconds
    execution_info['memory_usage'] = get_memory_usage()

# Clean up empty lines and format output
if execution_info['output']:
    execution_info['output'] = [line for line in execution_info['output'] if line.strip() or line == '']
    # Remove trailing empty lines
    while execution_info['output'] and not execution_info['output'][-1].strip():
        execution_info['output'].pop()

# Print results in a format that can be parsed by the executor
print("=== EXECUTION_START ===")
if execution_info['success']:
    for line in execution_info['output']:
        print(line)
else:
    for error in execution_info['errors']:
        print(error, file=sys.stderr)
print("=== EXECUTION_END ===")

# Debug information (will be captured separately)
print(f"=== DEBUG_INFO ===", file=sys.stderr)
print(f"Execution time: {execution_info['execution_time']:.2f}ms", file=sys.stderr)
print(f"Memory usage: {execution_info['memory_usage']:.2f}MB", file=sys.stderr)
print(f"Success: {execution_info['success']}", file=sys.stderr)
print(f"Lines of code: {execution_info['line_count']}", file=sys.stderr)
`;
  }

  private wrapCodeForNoInput(code: string): string {
    // Enhanced input handling for cases where code expects input but none is provided
    if (code.includes('input(') && !code.includes('# Test case')) {
      return `
# Enhanced wrapper with better input handling
import sys
from io import StringIO

# Detect what kind of input might be expected
lines = '''${code.replace(/'/g, "\\'")}'''.split('\\n')
input_calls = [line for line in lines if 'input(' in line]

# Provide reasonable default inputs
default_inputs = []
for call in input_calls:
    if 'int(' in call:
        default_inputs.append('1')
    elif 'float(' in call:
        default_inputs.append('1.0')
    else:
        default_inputs.append('test')

# Set up mock input
if default_inputs:
    sys.stdin = StringIO('\\n'.join(default_inputs))
else:
    sys.stdin = StringIO('1\\n')  # Basic fallback

# Execute original code
${code}
`;
    }
    return code;
  }

  async executeWithTracing(request: ExecutionRequest): Promise<ExecutionResult & { tracingData?: any }> {
    // Execute with additional tracing information
    const result = await this.execute(request);
    
    // Parse debug information from stderr if available
    let tracingData: tracingData = {};
    if (result.errors && result.errors.length > 0) {
      const debugInfoStart = result.errors.findIndex(line => line.includes('=== DEBUG_INFO ==='));
      if (debugInfoStart !== -1) {
        const debugLines = result.errors.slice(debugInfoStart + 1);

        for (const line of debugLines) {
          if (line.includes('Execution time:')) {
            tracingData.executionTime = parseFloat(line.split(':')[1]?.trim() ?? '0');
          } else if (line.includes('Memory usage:')) {
            tracingData.memoryUsage = parseFloat(line.split(':')[1]?.trim() ?? '0');
          } else if (line.includes('Success:')) {
            tracingData.success = line.split(':')[1]?.trim() === 'True';
          } else if (line.includes('Lines of code:')) {
            tracingData.lineCount = parseInt(line.split(':')[1]?.trim() ?? '0');
          }
        }

        // Remove debug info from errors
        result.errors = result.errors.slice(0, debugInfoStart);
      }
    }

    return {
      ...result,
      tracingData
    };
  }
}

interface tracingData {
    executionTime?: number;
    memoryUsage?: number;
    success?: boolean;
    lineCount?: number;
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