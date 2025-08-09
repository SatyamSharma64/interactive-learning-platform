import express from 'express';
import cors from 'cors';
import { PythonExecutor } from './executors/PythonExecutor.js';
import { JavaScriptExecutor } from './executors/JavaScriptExecutor.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const executors = {
  python: new PythonExecutor(),
  javascript: new JavaScriptExecutor(),
};

app.post('/api/execute', async (req, res) => {
  console.log('Received execution request:', req.body);
  try {
    const { code, language, input, timeLimit = 5000, memoryLimit = 128 } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const executor = executors[language.toLowerCase() as keyof typeof executors];
    if (!executor) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const result = await executor.execute({
      code,
      language,
      input,
      timeLimit,
      memoryLimit,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/validate', async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    const executor = executors[language.toLowerCase() as keyof typeof executors];
    if (!executor) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const results: Array<{
      input: any;
      expectedOutput: any;
      actualOutput: any;
      passed: boolean;
      executionTime: any;
      success: any;
      errors: any;
    }> = [];
    for (const testCase of testCases) {
      const result = await executor.execute({
        code,
        language,
        input: testCase.input,
        timeLimit: 5000,
        memoryLimit: 128,
      });
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output.join('\n'),
        passed: result.output.join('\n').trim() === testCase.output.trim(),
        executionTime: result.executionTime,
        success: result.success,
        errors: result.errors,
      });
    }

    const allPassed = results.every(r => r.passed && r.success);
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    res.json({
      allPassed,
      totalExecutionTime: totalTime,
      testResults: results,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🔧 Execution service running on port ${PORT}`);
});