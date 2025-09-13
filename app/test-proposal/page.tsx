"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestProposalPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testProposal = async () => {
    try {
      setLoading(true)
      setResult('Testing...')
      
      const response = await fetch('/api/test-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Success: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Error ${response.status}: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Proposal Creation</h1>
        
        <Button 
          onClick={testProposal}
          disabled={loading}
          className="mb-6"
        >
          {loading ? 'Testing...' : 'Test Proposal Creation'}
        </Button>
        
        {result && (
          <div className="bg-black p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
