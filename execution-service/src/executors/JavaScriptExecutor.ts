import { BaseExecutor, type ExecutionRequest, type ExecutionResult } from './BaseExecutor.js';

export class JavaScriptExecutor extends BaseExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const script = `
const originalConsoleLog = console.log;
let output = '';

console.log = (...args) => {
  output += args.join(' ') + '\\n';
  originalConsoleLog(...args);
};

try {
  ${request.code}
} catch (error) {
  console.error(error.message);
}
`;

    return await this.runInContainer(
      'node:18-alpine',
      `echo '${script.replace(/'/g, "\\'")}' > /tmp/solution.js && node /tmp/solution.js`,
      request.input,
      request.timeLimit,
      request.memoryLimit
    );
  }
}