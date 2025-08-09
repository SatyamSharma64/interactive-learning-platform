import OpenAI from 'openai';
import { prisma } from '../lib/prisma.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CodeAnalysisRequest {
  problemDescription: string;
  userCode: string;
  language: string;
  testResults: TestResult[];
  attemptNumber: number;
}

export interface CodeAnalysisResponse {
  feedback: string;
  suggestions: string[];
  hint?: string | undefined;
  confidence: number;
  errorTypes: string[];
}

export class AIService {
  async analyzeFailedCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    const { problemDescription, userCode, language, testResults, attemptNumber } = request;
    
    const failedTests = testResults.filter(t => !t.passed);
    const successfulTests = testResults.filter(t => t.passed);
    
    const prompt = this.buildAnalysisPrompt(
      problemDescription,
      userCode,
      language,
      failedTests,
      successfulTests,
      attemptNumber
    );

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert programming tutor. Provide helpful, educational feedback on code submissions without giving away complete solutions too early.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseAIResponse(content, attemptNumber);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackResponse(attemptNumber);
    }
  }

  private buildAnalysisPrompt(
    problemDescription: string,
    userCode: string,
    language: string,
    failedTests: TestResult[],
    successfulTests: TestResult[],
    attemptNumber: number
  ): string {
    let detailLevel = '';
    if (attemptNumber === 1) {
      detailLevel = 'Provide high-level conceptual guidance without revealing implementation details.';
    } else if (attemptNumber === 2) {
      detailLevel = 'Provide algorithmic hints and approach suggestions.';
    } else if (attemptNumber === 3) {
      detailLevel = 'Provide specific implementation guidance and point out exact issues.';
    } else {
      detailLevel = 'Provide a complete explanation of the solution approach.';
    }

    return `
Problem: ${problemDescription}

User's ${language} code:
\`\`\`${language}
${userCode}
\`\`\`

Test Results:
Passed: ${successfulTests.length}/${successfulTests.length + failedTests.length}

Failed Test Cases:
${failedTests.map(test => `
Input: ${test.input}
Expected: ${test.expectedOutput}
Got: ${test.actualOutput}
Error: ${test.errors?.join(', ') || 'None'}
`).join('\n')}

This is attempt #${attemptNumber}.

Instructions: ${detailLevel}

Please provide:
1. Brief analysis of what's wrong
2. 2-3 specific suggestions for improvement
3. ${attemptNumber <= 2 ? 'A hint for the next step' : 'Detailed explanation of the correct approach'}
4. Rate your confidence (1-10)
5. Categorize the error types (logic, syntax, algorithm, edge-cases, etc.)

Format your response as JSON:
{
  "feedback": "Your analysis here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "hint": "Your hint here (if applicable)",
  "confidence": 8,
  "errorTypes": ["logic", "edge-cases"]
}
`;
  }

  private parseAIResponse(content: string, attemptNumber: number): CodeAnalysisResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          feedback: parsed.feedback || 'Could not analyze the code.',
          suggestions: parsed.suggestions || [],
          hint: attemptNumber <= 2 ? parsed.hint : undefined,
          confidence: parsed.confidence || 5,
          errorTypes: parsed.errorTypes || ['unknown'],
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return this.getFallbackResponse(attemptNumber);
  }

  private getFallbackResponse(attemptNumber: number): CodeAnalysisResponse {
    const fallbackMessages = {
      1: 'Your solution has some issues. Try reviewing the problem requirements and check your logic flow.',
      2: 'Consider the algorithm you\'re using. Are you handling all the input cases correctly?',
      3: 'Look at the failed test cases carefully. What specific scenarios is your code not handling?',
      4: 'Try breaking down the problem into smaller steps and implement each part carefully.',
    };

    return {
      feedback: fallbackMessages[Math.min(attemptNumber, 4) as keyof typeof fallbackMessages] || fallbackMessages[4],
      suggestions: ['Review the problem statement', 'Check your algorithm', 'Test with edge cases'],
      hint: attemptNumber <= 2 ? 'Think about the problem step by step.' : undefined,
      confidence: 3,
      errorTypes: ['unknown'],
    };
  }

  async generateHint(problemId: string, attemptNumber: number): Promise<string> {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { suggestions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!problem) {
      return 'Problem not found.';
    }

    const availableHints = problem.suggestions.filter(
      (suggestion: { revealAfterAttempts: number }) => suggestion.revealAfterAttempts <= attemptNumber
    );

    if (availableHints.length > 0) {
      const latestHint = availableHints[availableHints.length - 1];
      return latestHint?.suggestionText || 'Keep trying! Consider the problem requirements carefully.';
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate a helpful hint for this programming problem. Be encouraging and educational.',
          },
          {
            role: 'user',
            content: `Problem: ${problem.description}\n\nGenerate a hint for attempt #${attemptNumber}. Make it progressively more specific based on the attempt number.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || 'Keep trying! Consider the problem requirements carefully.';
    } catch (error) {
      return 'Keep trying! Consider the problem requirements carefully.';
    }
  }
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  errors?: string[];
}