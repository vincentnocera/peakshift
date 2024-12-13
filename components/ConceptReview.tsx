import { useState } from 'react'
import { Concept } from '@/types/concepts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ConceptReviewProps {
  concepts: Partial<Concept>[]
  onSave: (concepts: Partial<Concept>[]) => Promise<void>
}

export default function ConceptReview({ concepts: initialConcepts, onSave }: ConceptReviewProps) {
  const [concepts, setConcepts] = useState(initialConcepts)
  const [isSaving, setIsSaving] = useState(false)

  const updateConcept = (index: number, updates: Partial<Concept>) => {
    setConcepts(prev => {
      const newConcepts = [...prev]
      newConcepts[index] = { ...newConcepts[index], ...updates }
      return newConcepts
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(concepts)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Extracted Concepts</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {concepts.map((concept, index) => (
          <AccordionItem key={index} value={`concept-${index}`}>
            <Card>
              <CardHeader>
                <AccordionTrigger className="hover:no-underline">
                  <CardTitle>{concept.name || `Concept ${index + 1}`}</CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-4">
                  {/* Name and Definition */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Concept Name"
                      value={concept.name || ''}
                      onChange={e => updateConcept(index, { name: e.target.value })}
                    />
                    <Textarea
                      placeholder="Definition"
                      value={concept.definition || ''}
                      onChange={e => updateConcept(index, { definition: e.target.value })}
                    />
                  </div>

                  {/* Relevant Quotes */}
                  <div className="space-y-2">
                    <CardDescription>Relevant Quotes</CardDescription>
                    {concept.relevantQuotes?.map((quote, quoteIndex) => (
                      <Textarea
                        key={quoteIndex}
                        value={quote}
                        onChange={e => {
                          const newQuotes = [...(concept.relevantQuotes || [])]
                          newQuotes[quoteIndex] = e.target.value
                          updateConcept(index, { relevantQuotes: newQuotes })
                        }}
                      />
                    ))}
                  </div>

                  {/* Misunderstandings */}
                  <div className="space-y-2">
                    <CardDescription>Common Misunderstandings</CardDescription>
                    {concept.commonMisunderstandings?.map((misunderstanding, misIndex) => (
                      <div key={misIndex} className="space-y-2 border p-2 rounded">
                        <Textarea
                          placeholder="Description"
                          value={misunderstanding.description}
                          onChange={e => {
                            const newMisunderstandings = [...(concept.commonMisunderstandings || [])]
                            newMisunderstandings[misIndex] = {
                              ...newMisunderstandings[misIndex],
                              description: e.target.value
                            }
                            updateConcept(index, { commonMisunderstandings: newMisunderstandings })
                          }}
                        />
                        {misunderstanding.probingQuestions?.map((question, qIndex) => (
                          <Input
                            key={qIndex}
                            placeholder={`Question ${qIndex + 1}`}
                            value={question}
                            onChange={e => {
                              const newMisunderstandings = [...(concept.commonMisunderstandings || [])]
                              newMisunderstandings[misIndex].probingQuestions[qIndex] = e.target.value
                              updateConcept(index, { commonMisunderstandings: newMisunderstandings })
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <CardDescription>Examples</CardDescription>
                    {concept.examples?.map((example, exampleIndex) => (
                      <Textarea
                        key={exampleIndex}
                        value={example}
                        onChange={e => {
                          const newExamples = [...(concept.examples || [])]
                          newExamples[exampleIndex] = e.target.value
                          updateConcept(index, { examples: newExamples })
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
} 