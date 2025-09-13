"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeftIcon, TimerIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"

export default function CheckExpiredProposalsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckExpiredProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/cron/check-expired-proposals?apiKey=demo-key")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check expired proposals")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred while checking expired proposals")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.replace("/")
    return null
  }

  // Only ADMIN and SUPER_ADMIN can access this page
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="mb-6 bg-black border-secondary hover:bg-black text-slate-300 hover:text-slate-100"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
          <AlertCircleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Only administrators can check expired proposals.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard")}
        className="mb-6 bg-black border-secondary hover:bg-black text-slate-300 hover:text-slate-100"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="bg-black border-secondary max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TimerIcon className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-xl">Check Expired Proposals</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            This tool checks for proposals that have reached their expiration date but are still in the "In Review"
            status. It will automatically update their status to "Expired".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
              <AlertCircleIcon className="h-5 w-5 text-red-400" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="bg-green-900/30 border-green-700 text-green-300">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.updatedProposals && result.updatedProposals.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Updated proposals:</p>
                    <ul className="list-disc list-inside mt-1">
                      {result.updatedProposals.map((proposal: any) => (
                        <li key={proposal.id}>{proposal.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleCheckExpiredProposals}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                Checking...
              </>
            ) : (
              <>
                <TimerIcon className="mr-2 h-4 w-4" />
                Check Expired Proposals
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
