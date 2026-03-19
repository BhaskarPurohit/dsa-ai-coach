// backend/src/services/judge0.service.ts
import axios from 'axios';

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Result {
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: number;
}

export class Judge0Service {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY || '';
  }

  private getLanguageId(language: string): number {
    const languageMap: { [key: string]: number } = {
      javascript: 63, // Node.js
      python: 71      // Python 3
    };
    return languageMap[language] || 63;
  }

  async executeCode(
    code: string,
    language: 'javascript' | 'python',
    testCases: Array<{ input: any; expectedOutput: any }>
  ): Promise<{
    passed: boolean;
    totalTests: number;
    passedTests: number;
    results: Array<{
      passed: boolean;
      input: any;
      expectedOutput: any;
      actualOutput: any;
      error?: string;
      executionTime?: string;
    }>;
  }> {
    const results = [];
    let passedTests = 0;

    for (const testCase of testCases) {
      try {
        const result = await this.runSingleTest(code, language, testCase);
        results.push(result);
        if (result.passed) passedTests++;
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      passed: passedTests === testCases.length,
      totalTests: testCases.length,
      passedTests,
      results
    };
  }

  private async runSingleTest(
    code: string,
    language: 'javascript' | 'python',
    testCase: { input: any; expectedOutput: any }
  ): Promise<any> {
    // Wrap the code to handle input/output
    const wrappedCode = this.wrapCode(code, language, testCase.input);

    const submission: Judge0Submission = {
      source_code: Buffer.from(wrappedCode).toString('base64'),
      language_id: this.getLanguageId(language),
      stdin: ''
    };

    // Submit code
    const submitResponse = await axios.post(
      `${this.baseURL}/submissions?base64_encoded=true&wait=true`,
      submission,
      {
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    const result: Judge0Result = submitResponse.data;

    // Decode output
    const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '';

    if (result.status.id !== 3) { // 3 = Accepted
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        error: stderr || result.status.description,
        executionTime: result.time
      };
    }

    // Parse output and compare
    const actualOutput = this.parseOutput(stdout.trim(), language);
    const passed = this.compareOutputs(actualOutput, testCase.expectedOutput);

    return {
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      executionTime: result.time
    };
  }

  private wrapCode(code: string, language: 'javascript' | 'python', input: any): string {
    if (language === 'javascript') {
      return `
${code}

// Test execution
const input = ${JSON.stringify(input)};
const result = ${this.extractFunctionName(code)}(...Object.values(input));
console.log(JSON.stringify(result));
      `;
    } else {
      // Python
      return `
${code}

# Test execution
import json
input_data = ${JSON.stringify(input).replace(/"/g, "'")}
result = ${this.extractFunctionName(code)}(**input_data)
print(json.dumps(result))
      `;
    }
  }

  private extractFunctionName(code: string): string {
    // Extract function name from code
    const jsMatch = code.match(/function\s+(\w+)/);
    const pyMatch = code.match(/def\s+(\w+)/);
    return jsMatch ? jsMatch[1] : (pyMatch ? pyMatch[1] : 'solution');
  }

  private parseOutput(output: string, language: string): any {
    try {
      return JSON.parse(output);
    } catch {
      return output;
    }
  }

  private compareOutputs(actual: any, expected: any): boolean {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
}

export const judge0Service = new Judge0Service();