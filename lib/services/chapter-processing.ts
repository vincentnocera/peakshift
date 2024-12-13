import { Concept, ConceptAnalysis } from '../../types/concepts'

export class ChapterProcessingService {
  private async makeAICall(prompt: string): Promise<any> {
    // TODO: Implement actual AI call using your preferred provider
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })
    
    if (!response.ok) {
      throw new Error('AI call failed')
    }
    
    return response.json()
  }

  async extractConcepts(chapterContent: string): Promise<Partial<Concept>[]> {
    const prompt = `
      Analyze this chapter and identify the most important high-yield concepts.
      For each concept, provide a precise definition.
      
      Chapter content:
      ${chapterContent}
      
      Provide your response in the following JSON format:
      {
        "concepts": [
          {
            "name": "concept name",
            "definition": "precise definition"
          }
        ]
      }
    `

    const response = await this.makeAICall(prompt)
    return response.concepts
  }

  async analyzeConceptDetails(
    concept: Partial<Concept>,
    chapterContent: string
  ): Promise<ConceptAnalysis> {
    const prompt = `
      Reread this chapter focusing on the concept: "${concept.name}"
      Definition: "${concept.definition}"

      Chapter content:
      ${chapterContent}

      Provide:
      1. 2-3 relevant quotes from the chapter that best illustrate this concept
      2. 2-3 common misunderstandings or "near-misses" of this concept, each with 2 probing questions
      3. 2-3 examples of this concept in action (either in daily life or clinical settings)

      Format your response as JSON:
      {
        "relevantQuotes": ["quote 1", "quote 2"],
        "commonMisunderstandings": [
          {
            "description": "misunderstanding description",
            "probingQuestions": ["question 1", "question 2"]
          }
        ],
        "examples": ["example 1", "example 2"]
      }
    `

    return await this.makeAICall(prompt)
  }
} 