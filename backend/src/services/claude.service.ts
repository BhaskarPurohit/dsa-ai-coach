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
    const hintLevelGuide = {
      0: 'Ask a thought-provoking question that guides them toward the right approach without giving it away',
      1: 'Point them toward the right data structure or algorithmic approach',
      2: 'Explain the algorithm steps in plain English without code',
      3: 'Provide detailed pseudocode'
    };

    const systemPrompt = `You are a patient and encouraging DSA tutor. Your goal is to help students learn by guiding them, not by giving direct answers.

Current hint level: ${hintLevel} (0-3)
Hint guidance: ${hintLevelGuide[hintLevel as keyof typeof hintLevelGuide]}

Rules:
- Be encouraging and positive
- Never give the complete solution unless hint level is 3 AND they've made at least 3 attempts
- Build on previous hints if any exist
- Use analogies and real-world examples
- Ask guiding questions when appropriate`;

    const userPrompt = `Problem: ${problemTitle}

Description: ${problemDescription}

Student's current attempt (Attempt #${attemptCount}):
\`\`\`
${userCode || 'No code submitted yet'}
\`\`\`

${previousHints.length > 0 ? `Previous hints given:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}` : ''}

Provide hint level ${hintLevel} for this problem.`;

    const hint = await this.chat([
      { role: 'user', content: userPrompt }
    ], systemPrompt);

    return hint;
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