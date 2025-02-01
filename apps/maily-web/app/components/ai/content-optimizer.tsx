'use client'

import { useState, useEffect } from 'react'
import { AIService } from '@/lib/services/ai-service'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Wand2,
  Sparkles,
  MessageSquare,
  Target,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react'

interface ContentOptimizerProps {
  content: string
  onOptimize: (optimizedContent: string) => void
  aiService: AIService
}

interface Suggestion {
  type: 'improvement' | 'warning' | 'success'
  message: string
  score: number
}

export function ContentOptimizer({
  content,
  onOptimize,
  aiService,
}: ContentOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [optimizedContent, setOptimizedContent] = useState(content)
  const [selectedTab, setSelectedTab] = useState('suggestions')
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<{
    sentiment: string
    readability: number
    suggestions: string[]
  } | null>(null)

  useEffect(() => {
    if (content) {
      analyzeContent()
    }
  }, [content])

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await aiService.analyzeContent(content)
      setAnalysis(result)

      const newSuggestions: Suggestion[] = [
        ...result.suggestions.map((suggestion) => ({
          type: 'improvement',
          message: suggestion,
          score: 0.8,
        })),
      ]

      if (result.readability < 60) {
        newSuggestions.push({
          type: 'warning',
          message: 'Content readability could be improved',
          score: result.readability / 100,
        })
      } else {
        newSuggestions.push({
          type: 'success',
          message: 'Content has good readability',
          score: result.readability / 100,
        })
      }

      setSuggestions(newSuggestions)
    } catch (error: any) {
      setError('Failed to analyze content: ' + error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      const goals = suggestions
        .filter((s) => s.type === 'improvement')
        .map((s) => s.message)

      const optimized = await aiService.optimizeContent(content, goals)
      setOptimizedContent(optimized)
      onOptimize(optimized)
    } catch (error: any) {
      setError('Failed to optimize content: ' + error.message)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGenerateSubjectLines = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      const subjectLines = await aiService.generateSubjectLines(content, 5)
      setSuggestions((prev) => [
        ...prev,
        {
          type: 'improvement',
          message: 'Suggested subject lines:\n' + subjectLines.join('\n'),
          score: 0.9,
        },
      ])
    } catch (error: any) {
      setError('Failed to generate subject lines: ' + error.message)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="suggestions" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center">
            <Target className="mr-2 h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2">Analyzing content...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Sentiment</Label>
                        <p className="mt-1 text-sm">{analysis.sentiment}</p>
                      </div>
                      <div>
                        <Label>Readability Score</Label>
                        <p className="mt-1 text-sm">{analysis.readability}/100</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`rounded-md p-3 ${
                          suggestion.type === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900/50'
                            : suggestion.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/50'
                            : 'bg-blue-50 dark:bg-blue-900/50'
                        }`}
                      >
                        <div className="flex items-start">
                          {suggestion.type === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          ) : suggestion.type === 'success' ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-blue-400" />
                          )}
                          <p className="ml-3 text-sm">{suggestion.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateSubjectLines}
                      disabled={isOptimizing}
                    >
                      Generate Subject Lines
                    </Button>
                    <Button onClick={analyzeContent} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Optimized Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={optimizedContent}
                  onChange={(e) => setOptimizedContent(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Optimized content will appear here..."
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setOptimizedContent(content)}
                    disabled={isOptimizing}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="flex items-center"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Optimize Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 