import axios from 'axios';
import type { ExecutionResult } from '../../../shared/src/types.js';

export interface TracingRequest {
  code: string;
  language: string;
  input?: string;
}

export interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, any>;
  output?: string;
  callStack: string[];
  description: string;
  stepNumber: number | undefined;
}


function getLast<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}

export class CodeTracingService {
  async generateExecutionTrace(request: TracingRequest): Promise<ExecutionStep[]> {
    const { code, language, input = '' } = request;

    switch (language.toLowerCase()) {
      case 'python':
        return this.tracePythonExecution(code, input);
      case 'javascript':
        return this.traceJavaScriptExecution(code, input);
      default:
        throw new Error(`Tracing not supported for language: ${language}`);
    }
  }

  private async tracePythonExecution(code: string, input: string): Promise<ExecutionStep[]> {
    // Normalize line endings to prevent indentation errors
    const cleanCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    // Use base64 encoding to safely pass the code to avoid escaping issues
    console.log('Executing Python script', cleanCode);
    const encodedCode = Buffer.from(cleanCode).toString('base64');
    const encodedInput = Buffer.from(input || '').toString('base64');
    
    const tracingScript = `
import sys
import json
import io
import base64
import traceback
from contextlib import redirect_stdout
from types import FrameType
from typing import Any, Dict, List

# Store execution steps
execution_steps = []

# Decode the original code from base64
try:
    original_code = base64.b64decode("${encodedCode}").decode('utf-8')
    original_lines = original_code.split('\\n')
except Exception as e:
    print("TRACE_START")
    print(json.dumps([{
        'lineNumber': -1,
        'variables': {},
        'callStack': [],
        'description': f"Error decoding code: {str(e)}",
        'output': str(e),
        'stepNumber': 1
    }], indent=2))
    print("TRACE_END")
    sys.exit(0)

def safe_serialize(obj):
    """Safely serialize objects for JSON output"""
    try:
        if obj is None or isinstance(obj, (int, float, str, bool)):
            return obj
        elif isinstance(obj, (list, tuple)):
            return [safe_serialize(item) for item in list(obj)[:10]]  # Limit to 10 items
        elif isinstance(obj, dict):
            return {k: safe_serialize(v) for k, v in list(obj.items())[:10]}  # Limit to 10 items
        else:
            return str(obj)[:200]  # Limit string length
    except:
        return "<serialization_error>"

def trace_calls(frame, event, arg):
    """Trace function calls and line executions"""
    if event == 'line':
        filename = frame.f_code.co_filename
        if filename == '<string>':
            line_no = frame.f_lineno
            
            # For exec() calls, the line numbers start from 1 for the user code
            if 1 <= line_no <= len(original_lines):
                # Get local variables, excluding tracing variables
                variables = {}
                for k, v in frame.f_locals.items():
                    if not k.startswith('__') and k not in [
                        'trace_calls', 'execution_steps', 'original_code', 
                        'original_lines', 'safe_serialize', 'encoded_input',
                        'output_buffer', 'input_lines', 'input_index', 'mock_input'
                    ]:
                        variables[k] = safe_serialize(v)
                
                # Build call stack
                call_stack = []
                current_frame = frame
                while current_frame and len(call_stack) < 5:
                    func_name = current_frame.f_code.co_name
                    if func_name != '<module>' and not func_name.startswith('trace_') and func_name != 'safe_serialize':
                        call_stack.append(f"{func_name}()")
                    current_frame = current_frame.f_back
                
                # Get line content
                try:
                    line_content = original_lines[line_no - 1].strip()
                    if line_content:
                        description = f"Executing: {line_content}"
                    else:
                        description = f"Executing line {line_no}"
                except IndexError:
                    description = f"Executing line {line_no}"
                
                step = {
                    'lineNumber': line_no,
                    'variables': variables,
                    'callStack': call_stack[::-1],  # Reverse to show correct order
                    'description': description,
                    'stepNumber': len(execution_steps) + 1
                }
                
                execution_steps.append(step)
    
    return trace_calls

# Set up input redirection if input is provided
try:
    input_data = base64.b64decode("${encodedInput}").decode('utf-8') if "${encodedInput}" else ""
    input_lines = input_data.strip().split('\\n') if input_data else []
    # Clean up the input lines to handle mixed line endings
    input_lines = [line.replace('\\r', '').strip() for line in input_lines if line.strip()]
except:
    input_lines = []

input_index = 0

def mock_input(prompt=''):
    global input_index
    if input_index < len(input_lines):
        result = input_lines[input_index]
        input_index += 1
        return result
    return ''

# Replace built-in input function if we have input
if input_lines:
    import builtins
    builtins.input = mock_input

# Set up tracing
sys.settrace(trace_calls)

# Capture output
output_buffer = io.StringIO()

try:
    with redirect_stdout(output_buffer):
        # Execute the user code
        exec(original_code, {'__name__': '__main__'})
        
except Exception as e:
    error_msg = f"{type(e).__name__}: {str(e)}"
    execution_steps.append({
        'lineNumber': -1,
        'variables': {},
        'callStack': [],
        'description': f"Runtime Error: {error_msg}",
        'output': error_msg,
        'stepNumber': len(execution_steps) + 1
    })

# Capture any output
output = output_buffer.getvalue()
if output and execution_steps:
    execution_steps[-1]['output'] = output.strip()

# Disable tracing before output
sys.settrace(None)

# Output results
print("TRACE_START")
print(json.dumps(execution_steps, indent=2))
print("TRACE_END")
`;

    try {
      const executionResponse = await axios.post(`${process.env.EXECUTION_SERVICE_URL}/api/execute`, {
        code: tracingScript,
        language: 'python',
        testCases: [{
            input: input,
            output: null,
          }],
        timeLimit: 10000,
        memoryLimit: 256,
      });

      const { allPassed, totalExecutionTime, testResults } = executionResponse.data;

      console.log('Python tracing result:', executionResponse.data);
      if (!testResults || !Array.isArray(testResults) || testResults.length === 0) {
        console.log('No test results available');
        throw new Error('Execution failed - no test results');
      }

      const firstResult = testResults[0];
      
      // Check if the execution was successful
      if (!firstResult.success) {
        console.log('Execution failed:', firstResult.errors);
        throw new Error(`Execution failed: ${firstResult.errors?.join(', ') || 'Unknown error'}`);
      }

      // Get the actual output - it might be a string or array
      let output: string;
      if (Array.isArray(firstResult.actualOutput)) {
        output = firstResult.actualOutput.join('\n');
      } else if (typeof firstResult.actualOutput === 'string') {
        output = firstResult.actualOutput;
      } else {
        console.log('Unexpected output format:', firstResult.actualOutput);
        throw new Error('Unexpected output format from execution');
      }

      console.log('Raw output:', output);

      // Find trace markers
      const startIndex = output.indexOf('TRACE_START');
      const endIndex = output.indexOf('TRACE_END');
      
      console.log('Start index:', startIndex, 'End index:', endIndex);
      
      if (startIndex === -1 || endIndex === -1) {
        console.log('Could not find trace markers in output');
        return this.createFallbackSteps(code, 'Could not extract trace - markers not found');
      }

      // Extract the JSON between markers
      const traceJson = output.substring(
        startIndex + 'TRACE_START'.length,
        endIndex
      ).trim();

      console.log('Extracted trace JSON:', traceJson);

      if (!traceJson) {
        return this.createFallbackSteps(code, 'Empty trace data');
      }

      try {
        const steps = JSON.parse(traceJson);
        
        if (!Array.isArray(steps)) {
          console.log('Steps is not an array:', steps);
          return this.createFallbackSteps(code, 'Invalid trace format');
        }

        // Ensure step numbers are properly set
        return steps.map((step: any, index: number) => ({
          lineNumber: step.lineNumber || 1,
          variables: step.variables || {},
          callStack: step.callStack || [],
          description: step.description || `Step ${index + 1}`,
          output: step.output,
          stepNumber: index + 1,
        }));

      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Failed to parse JSON:', traceJson.substring(0, 500));
        return this.createFallbackSteps(code, `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

    } catch (error) {
      console.error('Python tracing failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createFallbackSteps(code, errorMessage);
    }
  }

  private escapeForPython(code: string): string {
    return code
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  private async traceJavaScriptExecution(code: string, input: string): Promise<ExecutionStep[]> {
    // Simplified JavaScript tracing
    const cleanCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const lines = code.split('\n');
    const steps: ExecutionStep[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*')) {
        steps.push({
          lineNumber: index + 1,
          variables: this.extractJSVariables(trimmedLine, index),
          callStack: this.extractJSCallStack(trimmedLine),
          description: `Executing: ${trimmedLine}`,
          stepNumber: steps.length + 1,
        });
      }
    });

    try {
      const executionResponse = await axios.post(`${process.env.EXECUTION_SERVICE_URL}/api/execute`, {
        code,
        language: 'javascript',
        testCases: [{
          input: input,
          output: null,
        }],
        timeLimit: 5000,
        memoryLimit: 128,
      });

      const { allPassed, totalExecutionTime, testResults } = executionResponse.data;

      console.log('Python tracing result:', executionResponse.data);
      if (!testResults || !Array.isArray(testResults) || testResults.length === 0) {
        throw new Error('Execution failed - no test results');
      }

      const firstResult = testResults[0];
      
      if (!firstResult.success) {
        throw new Error(`Execution failed: ${firstResult.errors?.join(', ') || 'Unknown error'}`);
      }

      const lastStep = getLast(steps);
      if (lastStep && firstResult.actualOutput) {
        const output = Array.isArray(firstResult.actualOutput) 
          ? firstResult.actualOutput.join('\n') 
          : firstResult.actualOutput;
        lastStep.output = output;
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unexpected error';
      const lastStep = getLast(steps);
      if (lastStep) {
        lastStep.description = `Error: ${errorMsg}`;
        lastStep.output = errorMsg;
      }
    }

    return steps;
  }

  private extractJSVariables(line: string, lineIndex: number): Record<string, any> {
    // Simple variable extraction for JavaScript
    const variables: Record<string, any> = {};
    
    // Look for variable declarations
    const varMatch = line.match(/(let|const|var)\s+(\w+)\s*=\s*(.+)/);
    if (varMatch && varMatch[2]) {
      variables[varMatch[2]] = `<assigned at line ${lineIndex + 1}>`;
    }
    
    // Look for assignments
    const assignMatch = line.match(/(\w+)\s*=\s*(.+)/);
    if (assignMatch && !varMatch && assignMatch[1]) {
      variables[assignMatch[1]] = `<updated at line ${lineIndex + 1}>`;
    }
    
    return variables;
  }

  private extractJSCallStack(line: string): string[] {
    // Look for function calls
    const functionMatch = line.match(/(\w+)\s*\(/);
    if (functionMatch) {
      return [`${functionMatch[1]}()`];
    }
    return [];
  }

  private createFallbackSteps(code: string, error: string): ExecutionStep[] {
    return [{
      lineNumber: 1,
      variables: {},
      callStack: [],
      description: `Tracing failed: ${error}`,
      output: error,
      stepNumber: 1,
    }];
  }
}

export const tracingService = new CodeTracingService();