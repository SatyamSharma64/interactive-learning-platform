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
    const tracingScript = `
import sys
import json
import traceback
from types import FrameType
from typing import Any, Dict, List

execution_steps: List[Dict[str, Any]] = []
original_code_lines = """${code.replace(/"/g, '\\"')}""".split('\\n')

def trace_calls(frame: FrameType, event: str, arg: Any) -> Any:
    if event == 'line' and frame.f_code.co_filename == '<string>':
        line_no = frame.f_lineno
        
        # Skip our tracing setup lines
        if line_no <= len(original_code_lines):
            variables = {
                k: v for k, v in frame.f_locals.items() 
                if not k.startswith('__') and k not in ['trace_calls', 'execution_steps', 'original_code_lines']
            }
            
            serialized_vars = {}
            for k, v in variables.items():
                try:
                    if isinstance(v, (int, float, str, bool, type(None))):
                        serialized_vars[k] = v
                    elif isinstance(v, (list, tuple)):
                        serialized_vars[k] = list(v)
                    elif isinstance(v, dict):
                        serialized_vars[k] = dict(v)
                    else:
                        serialized_vars[k] = str(v)
                except:
                    serialized_vars[k] = str(v)
            
            call_stack = []
            current_frame = frame
            while current_frame and len(call_stack) < 10:
                if current_frame.f_code.co_filename == '<string>':
                    func_name = current_frame.f_code.co_name
                    if func_name != '<module>' and func_name != 'trace_calls':
                        call_stack.append(f"{func_name}()")
                current_frame = current_frame.f_back
            
            try:
                line_content = original_code_lines[line_no - 1].strip()
                description = f"Executing: {line_content}"
            except:
                description = f"Executing line {line_no}"
            
            step = {
                'lineNumber': line_no,
                'variables': serialized_vars,
                'callStack': call_stack[::-1],
                'description': description
            }
            
            execution_steps.append(step)
    
    return trace_calls

sys.settrace(trace_calls)

import io
from contextlib import redirect_stdout
output_buffer = io.StringIO()

try:
    with redirect_stdout(output_buffer):
        ${code}
except Exception as e:
    execution_steps.append({
        'lineNumber': -1,
        'variables': {},
        'callStack': [],
        'description': f"Error: {str(e)}",
        'output': str(e)
    })

output = output_buffer.getvalue()
if output and execution_steps:
    execution_steps[-1]['output'] = output

print("TRACE_START")
print(json.dumps(execution_steps))
print("TRACE_END")
`;

    try {
      const response: ExecutionResult = await axios.post('http://localhost:3001/execute', {
        code: tracingScript,
        language: 'python',
        input,
        timeLimit: 10000,
        memoryLimit: 256,
      });

      if (!response.success) {
        throw new Error('Execution failed');
      }

      const output = response.output.join('\n');
      const startIndex = output.indexOf('TRACE_START');
      const endIndex = output.indexOf('TRACE_END');
      
      if (startIndex === -1 || endIndex === -1) {
        return this.createFallbackSteps(code, 'Could not extract trace');
      }

      const traceJson = output.substring(
        startIndex + 'TRACE_START'.length,
        endIndex
      ).trim();

      const steps = JSON.parse(traceJson);
      return steps.map((step: any, index: number) => ({
        ...step,
        stepNumber: index + 1,
      }));

    } catch (error) {
      console.error('Python tracing failed:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as Error).message : String(error);
      return this.createFallbackSteps(code, errorMessage);
    }
  }

  private async traceJavaScriptExecution(code: string, input: string): Promise<ExecutionStep[]> {
    // Simplified JavaScript tracing
    const lines = code.split('\n');
    const steps: ExecutionStep[] = [];

    lines.forEach((line, index) => {
      if (line.trim()) {
        steps.push({
          lineNumber: index + 1,
          variables: {},
          callStack: [],
          description: `Executing: ${line.trim()}`,
          stepNumber: steps.length + 1,
        });
      }
    });

    try {
      const response: ExecutionResult = await axios.post('http://localhost:3001/execute', {
        code,
        language: 'javascript',
        input,
        timeLimit: 5000,
        memoryLimit: 128,
        });

        const lastStep = getLast(steps);
        if (lastStep) {
        lastStep.output = response.output.join('\n');
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