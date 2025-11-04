'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface RealEstateValidationErrorProps {
  message: string
  onClose?: () => void
}

export default function RealEstateValidationError({ 
  message, 
  onClose 
}: RealEstateValidationErrorProps) {
  // Parse the message to extract categories and examples
  const parseMessage = (msg: string) => {
    const categories: Array<{ number: string; name: string; details: string }> = []
    const examples: string[] = []
    
    // Extract categories from the message - pattern: (1) Category Name - details;
    const categoryPattern = /\((\d+)\)\s*([^–-]+)[–-]\s*([^;]+)/g
    let categoryMatch
    while ((categoryMatch = categoryPattern.exec(msg)) !== null) {
      categories.push({
        number: categoryMatch[1],
        name: categoryMatch[2].trim(),
        details: categoryMatch[3].trim()
      })
    }
    
    // Extract examples from "Examples include" or "Hint: Examples include" section
    const examplesMatch = msg.match(/(?:Examples include|Hint: Examples include)\s*([^"]+)/)
    if (examplesMatch) {
      // Extract all quoted strings
      const quotedExamples = msg.match(/"([^"]+)"/g)
      if (quotedExamples) {
        examples.push(...quotedExamples.map(e => e.replace(/"/g, '')))
      }
    }
    
    // Extract main message (first sentence ending with a period)
    const firstSentenceMatch = msg.match(/^([^.!?]+[.!?])/)
    const mainMessage = firstSentenceMatch 
      ? firstSentenceMatch[1].trim()
      : msg.split('Required categories:')[0]?.trim() || msg
    
    return { categories, examples, mainMessage }
  }

  const { categories, examples, mainMessage } = parseMessage(message)

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold mb-2">Content Validation Error</h3>
          <p className="text-red-700 text-sm mb-3 leading-relaxed">
            {mainMessage.length > 30 ? `${mainMessage.substring(0, 30)}...` : mainMessage}
          </p>
          
          {categories.length > 0 && (
            <div className="mt-3">
              <p className="text-red-700 text-sm font-medium mb-2">Required categories:</p>
              <div className="space-y-1.5">
                {categories.map((category, index) => (
                  <div key={index} className="text-red-700 text-sm">
                    <span className="font-semibold">
                      ({category.number}) {category.name}
                    </span>
                    <span className="ml-1">{category.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {examples.length > 0 && (
            <div className="mt-3">
              <p className="text-red-700 text-sm font-medium mb-1">Examples:</p>
              <div className="bg-white border border-red-200 rounded p-3">
                <p className="text-red-600 text-sm italic">
                  {examples.map((example, index) => (
                    <span key={index}>
                      {index > 0 && ', '}
                      &quot;{example}&quot;
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
