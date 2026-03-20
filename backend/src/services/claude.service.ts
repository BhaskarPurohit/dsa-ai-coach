// backend/src/services/claude.service.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export class ClaudeService {
  async chat(messages: Array<{ role: string; content: string }>, systemPrompt?: string) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  async generateHint(
    problemTitle: string,
    problemDescription: string,
    userCode: string,
    hintLevel: number,
    attemptCount: number,
    previousHints: string[]
  ): Promise<string> {
    // CodeSignal-style: three distinct hint tiers with increasing specificity
    const levelInstructions: Record<number, string> = {
      1: `Ask ONE single Socratic question that nudges the student toward the right insight.
Rules for level 1:
- Output ONLY a question. No statements, no explanations.
- The question should make them think about a specific edge case or invariant.
- Example style: "What happens to your window size when the current element is larger than the target sum?"
- Reference their code if it reveals a specific misconception.`,

      2: `Provide a pseudocode skeleton with the key logic lines replaced by blanks or comments.
Rules for level 2:
- Show the overall structure (loop, pointer movements, etc.)
- Replace the critical 1-2 lines with a comment like: // ← what condition goes here?
- Keep it language-agnostic (no actual code syntax)
- Add a one-line note explaining what the blank represents`,

      3: `Explain the complete solution approach clearly — the insight, the algorithm, and why it works.
Rules for level 3:
- Describe the approach in plain English step by step
- Explain the KEY insight (the "aha" moment)
- Give time and space complexity
- Do NOT write actual runnable code — describe the algorithm so they still write it themselves`
    };

    const clampedLevel = Math.max(1, Math.min(3, hintLevel));

    const systemPrompt = `You are Cosmo, an expert DSA coach. You use the Socratic method to guide students to solutions rather than handing them answers.

Your current task: provide a Level ${clampedLevel} hint.

${levelInstructions[clampedLevel]}

Student's code is provided — read it carefully and make your hint specific to what they actually wrote, not generic.`;

    const userPrompt = `Problem: "${problemTitle}"
${problemDescription}

Student's code (attempt #${attemptCount}):
\`\`\`
${userCode || '(no code yet)'}
\`\`\`
${previousHints.length > 0 ? `\nPrevious hints already given:\n${previousHints.map((h, i) => `Hint ${i + 1}: ${h}`).join('\n')}\n\nBuild on these — don't repeat the same angle.` : ''}

Provide the Level ${clampedLevel} hint now.`;

    return this.chat([{ role: 'user', content: userPrompt }], systemPrompt);
  }

  async generateContextualFeedback(
    problemTitle: string,
    problemDescription: string,
    userCode: string,
    attemptCount: number,
    failedTest: { input: any; expectedOutput: any; actualOutput: any } | null,
    executionError: string | null
  ): Promise<string> {
    const systemPrompt = `You are Cosmo, an encouraging DSA coach. A student just submitted code that didn't fully pass.

Your job: give SHORT, specific, actionable feedback (3-5 sentences max).

Rules:
- Start with something they did RIGHT (even if small)
- Reference their actual code approach by name (e.g. "I see you're using a two-pointer approach...")
- Point at the CONCEPTUAL gap, not just "wrong output"
- End with ONE specific thing to investigate — frame as a question
- NEVER say "wrong answer" or "incorrect solution"
- NEVER give the solution
- Tone: like a supportive coach, not a grader`;

    const failedTestInfo = failedTest
      ? `Failing test: input=${JSON.stringify(failedTest.input)}, expected=${JSON.stringify(failedTest.expectedOutput)}, got=${JSON.stringify(failedTest.actualOutput)}`
      : executionError
      ? `Runtime error: ${executionError}`
      : 'Some test cases failed';

    const userPrompt = `Problem: "${problemTitle}"
${problemDescription}

Student's code (attempt #${attemptCount}):
\`\`\`
${userCode}
\`\`\`

${failedTestInfo}

Give the contextual feedback now.`;

    return this.chat([{ role: 'user', content: userPrompt }], systemPrompt);
  }

  async explainPattern(
    pattern: string,
    patternKnowledge: any,
    userQuery?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert DSA teacher explaining the "${pattern}" pattern to a student.

Use this knowledge base:
${JSON.stringify(patternKnowledge, null, 2)}

Your explanation should:
- Start with an intuitive analogy or real-world example
- Explain when and why to use this pattern
- Describe the general approach
- Mention time and space complexity
- Be conversational and encouraging
- Use simple language`;

    const userPrompt = userQuery || `Explain the ${pattern} pattern to me`;

    const explanation = await this.chat([
      { role: 'user', content: userPrompt }
    ], systemPrompt);

    return explanation;
  }

  async analyzeSolution(
    code: string,
    problemTitle: string,
    expectedTimeComplexity: string,
    expectedSpaceComplexity: string
  ): Promise<string> {
    const systemPrompt = `You are a code reviewer analyzing a student's solution to: ${problemTitle}

Expected complexity:
- Time: ${expectedTimeComplexity}
- Space: ${expectedSpaceComplexity}

Provide:
1. ✅ What they did well
2. 📊 Time and space complexity analysis
3. 💡 Optimization suggestions (if any)
4. 🎯 Code quality feedback

Be encouraging and specific. Celebrate their success!`;

    const userPrompt = `Analyze this solution:

\`\`\`javascript
${code}
\`\`\``;

    const analysis = await this.chat([
      { role: 'user', content: userPrompt }
    ], systemPrompt);

    return analysis;
  }
}

export const claudeService = new ClaudeService();