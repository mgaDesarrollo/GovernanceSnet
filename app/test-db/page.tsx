"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function TestDBPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDB = async () => {
    try {
      setLoading(true)
      setResult('Testing...')
      
      const response = await fetch('/api/test-db')
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

  useEffect(() => {
    testDB()
  }, [])

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Database Connection</h1>
        
        <Button 
          onClick={testDB}
          disabled={loading}
          className="mb-6"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
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
