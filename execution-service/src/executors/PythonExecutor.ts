import { BaseExecutor, type ExecutionRequest, type ExecutionResult } from './BaseExecutor.js';

export class PythonExecutor extends BaseExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const script = `
import sys
import time
import resource

try:
    resource.setrlimit(resource.RLIMIT_AS, (${request.memoryLimit * 1024 * 1024}, ${request.memoryLimit * 1024 * 1024}))
except:
    pass

${request.code}
`;

    // Use a more robust approach to create the Python file
    const escapedScript = Buffer.from(script).toString('base64');
    const command = `echo '${escapedScript}' | base64 -d > /tmp/solution.py && python /tmp/solution.py`;

    return await this.runInContainer(
      'python:3.12-slim',
      command,
      request.input,
      request.timeLimit,
      request.memoryLimit
    );
  }
}