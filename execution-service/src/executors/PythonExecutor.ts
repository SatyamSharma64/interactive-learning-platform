import { BaseExecutor, type ExecutionRequest, type ExecutionResult } from './BaseExecutor.js';

export class PythonExecutor extends BaseExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    console.log('Executing Python script');
    
    // Clean the code to prevent formatting issues
    const cleanedCode = this.cleanCode(request.code);
    
    // Create a temporary file approach instead of inline execution
    const scriptTemplate = this.createExecutionScript(cleanedCode, request.input? request.input : '');
    
    // Use base64 encoding to safely pass the script to Docker
    const encodedScript = Buffer.from(scriptTemplate).toString('base64');
    
    // Create the command that will decode and run the script
    const command = `echo '${encodedScript}' | base64 -d > /tmp/user_script.py && cd /tmp && python user_script.py`;

    return await this.runInContainer(
      'python:3.12-slim',
      command,
      '', // Don't pass input through stdin since we handle it in the script
      request.timeLimit,
      request.memoryLimit
    );
  }

  private cleanCode(code: string): string {
    // Normalize line endings and clean up the code
    return code
      .replace(/\r\n/g, '\n')  // Convert Windows line endings
      .replace(/\r/g, '\n')    // Convert Mac line endings
      .trim();                 // Remove leading/trailing whitespace
  }

  private createExecutionScript(userCode: string, input: string): string {
    // Create a wrapper script that handles input and execution properly
    const inputLines = input ? input.split('\n').map(line => line.trim()).filter(Boolean) : [];
    
    // Safely encode the user code to avoid f-string issues
    const encodedUserCode = Buffer.from(userCode).toString('base64');
    const codeLineCount = userCode.split('\n').length;
    
    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import io
import base64
from contextlib import redirect_stdout, redirect_stderr
import traceback

# Execution timing and debugging
import time
import os

start_time = time.time()

# Set up input simulation if provided
input_lines = ${JSON.stringify(inputLines)}
input_index = 0

def mock_input(prompt=''):
    """Mock input function that returns predefined input lines"""
    global input_index
    if input_index < len(input_lines):
        result = input_lines[input_index]
        input_index += 1
        print(f"Input: {result}", file=sys.stderr)  # Debug: show what input was consumed
        return result
    return ''

# Replace built-in input function if we have input to provide
if input_lines:
    import builtins
    original_input = builtins.input
    builtins.input = mock_input

# Decode the user code from base64
try:
    user_code = base64.b64decode("${encodedUserCode}").decode('utf-8')
except Exception as e:
    print(f"Error decoding user code: {e}")
    sys.exit(1)

# Capture both stdout and stderr
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()

# print("=== EXECUTION_START ===")

try:
    with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
        # Execute the user code
        exec(user_code)
        
except Exception as e:
    # Capture the exception details
    error_type = type(e).__name__
    error_msg = str(e)
    
    # Get traceback information
    tb_lines = traceback.format_exc().splitlines()
    user_tb_lines = []
    
    for line in tb_lines:
        if '<string>' in line or 'line' in line:
            user_tb_lines.append(line)
    
    print(f"Error: {error_type}: {error_msg}")
    if user_tb_lines:
        print("\\n".join(user_tb_lines))

# Get captured output
captured_stdout = stdout_buffer.getvalue()
captured_stderr = stderr_buffer.getvalue()

# print("=== EXECUTION_END ===")

# Print captured output
if captured_stdout:
    print(captured_stdout.rstrip())

# Print any stderr content (but not our debug info)
if captured_stderr:
    stderr_lines = captured_stderr.split('\\n')
    for line in stderr_lines:
        if line.strip() and not line.startswith('Input:'):
            print(line, file=sys.stderr)

# Calculate execution stats
end_time = time.time()
execution_time = (end_time - start_time) * 1000  # Convert to milliseconds

try:
    import psutil
    process = psutil.Process(os.getpid())
    memory_usage = process.memory_info().rss / 1024 / 1024  # Convert to MB
except ImportError:
    memory_usage = 0
except:
    memory_usage = 0

# print("=== DEBUG_INFO ===", file=sys.stderr)
# print(f"Execution time: {execution_time:.2f}ms", file=sys.stderr)
# print(f"Memory usage: {memory_usage:.2f}MB", file=sys.stderr)
# print(f"Success: {len(captured_stderr.strip()) == 0}", file=sys.stderr)
# print(f"Lines of code: ${codeLineCount}", file=sys.stderr)
`;
  }

  private wrapCodeForNoInput(code: string): string {
    // This method is kept for backward compatibility but simplified
    const cleanedCode = this.cleanCode(code);
    
    // If the code expects input but none provided, add some default test input
    if (cleanedCode.includes('input()') && !cleanedCode.includes('# Test case')) {
      return `
# Auto-generated test input
import sys
from io import StringIO

# Default test input for demonstration
test_input = """2 7 11 15
9
"""

original_input = input
input_lines = test_input.strip().split('\\n')
input_index = 0

def mock_input(prompt=''):
    global input_index
    if input_index < len(input_lines):
        result = input_lines[input_index]
        input_index += 1
        return result
    return original_input(prompt)

import builtins
builtins.input = mock_input

${cleanedCode}
`;
    }
    
    return cleanedCode;
  }
}