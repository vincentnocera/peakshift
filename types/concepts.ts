export interface Concept {
  id: string
  chapterId: string
  name: string
  definition: string
  relevantQuotes: string[]
  commonMisunderstandings: {
    description: string
    probingQuestions: string[]
  }[]
  examples: string[]
  orderIndex: number
  dateAdded: string
}

export interface ConceptAnalysis {
  relevantQuotes: string[]
  commonMisunderstandings: {
    description: string
    probingQuestions: string[]
  }[]
  examples: string[]
}

export interface ProcessingStatus {
  stage: 'idle' | 'extracting-concepts' | 'analyzing-concepts' | 'review' | 'saving' | 'complete' | 'error'
  progress?: number
  totalSteps?: number
  error?: string
} 