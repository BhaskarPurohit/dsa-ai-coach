// backend/src/services/rag.service.ts
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

interface PatternKnowledge {
  [key: string]: unknown;
  pattern: string;
  description: string;
  intuition: string;
  pseudocode: string;
  whenToUse: string[];
  commonMistakes: string[];
  exampleProblems: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

export class RAGService {
  private client: WeaviateClient;

  constructor() {
    const rawUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const parsed = new URL(rawUrl);
    this.client = weaviate.client({
      scheme: parsed.protocol.replace(':', '') as 'http' | 'https',
      host: parsed.host, // e.g. "localhost:8080" without protocol
    });
  }

  async initializeSchema() {
    try {
      // Check if class exists
      const existingClasses = await this.client.schema.getter().do();
      const classExists = existingClasses.classes?.some(
        (c: any) => c.class === 'PatternKnowledge'
      );

      if (classExists) {
        console.log('PatternKnowledge schema already exists');
        return;
      }

      // Create schema
      await this.client.schema
        .classCreator()
        .withClass({
          class: 'PatternKnowledge',
          description: 'DSA pattern knowledge base',
          vectorizer: 'text2vec-transformers',
          properties: [
            {
              name: 'pattern',
              dataType: ['text'],
              description: 'Pattern name'
            },
            {
              name: 'description',
              dataType: ['text'],
              description: 'Pattern description'
            },
            {
              name: 'intuition',
              dataType: ['text'],
              description: 'Intuitive explanation'
            },
            {
              name: 'pseudocode',
              dataType: ['text'],
              description: 'General pseudocode'
            },
            {
              name: 'whenToUse',
              dataType: ['text[]'],
              description: 'When to use this pattern'
            },
            {
              name: 'commonMistakes',
              dataType: ['text[]'],
              description: 'Common mistakes to avoid'
            },
            {
              name: 'exampleProblems',
              dataType: ['text[]'],
              description: 'Example problems'
            },
            {
              name: 'timeComplexity',
              dataType: ['text'],
              description: 'Time complexity'
            },
            {
              name: 'spaceComplexity',
              dataType: ['text'],
              description: 'Space complexity'
            }
          ]
        })
        .do();

      console.log('PatternKnowledge schema created successfully');
    } catch (error) {
      console.error('Error initializing schema:', error);
      throw error;
    }
  }

  async storePattern(pattern: PatternKnowledge) {
    try {
      await this.client.data
        .creator()
        .withClassName('PatternKnowledge')
        .withProperties(pattern)
        .do();

      console.log(`Stored pattern: ${pattern.pattern}`);
    } catch (error) {
      console.error(`Error storing pattern ${pattern.pattern}:`, error);
      throw error;
    }
  }

  async searchPattern(query: string): Promise<PatternKnowledge | null> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName('PatternKnowledge')
        .withNearText({ concepts: [query] })
        .withFields('pattern description intuition pseudocode whenToUse commonMistakes exampleProblems timeComplexity spaceComplexity')
        .withLimit(1)
        .do();

      const data = result.data?.Get?.PatternKnowledge;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error searching pattern:', error);
      return null;
    }
  }

  async getPatternByName(patternName: string): Promise<PatternKnowledge | null> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName('PatternKnowledge')
        .withWhere({
          path: ['pattern'],
          operator: 'Equal',
          valueText: patternName
        })
        .withFields('pattern description intuition pseudocode whenToUse commonMistakes exampleProblems timeComplexity spaceComplexity')
        .withLimit(1)
        .do();

      const data = result.data?.Get?.PatternKnowledge;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting pattern by name:', error);
      return null;
    }
  }
}

export const ragService = new RAGService();