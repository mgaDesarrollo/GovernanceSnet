import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface LoadingSkeletonProps {
  type?: "page" | "card" | "list" | "spinner"
  className?: string
}

export function LoadingSkeleton({ type = "spinner", className = "" }: LoadingSkeletonProps) {
  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="relative">
          {/* Spinner principal */}
          <div className="w-12 h-12 border-4 border-secondary border-t-purple-500 rounded-full animate-spin"></div>
          
          {/* Punto central */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (type === "page") {
    return (
      <div className={`min-h-screen bg-black p-6 w-full ${className}`}>
        <div className="max-w-7xl mx-auto w-full">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-8 bg-slate-800 rounded w-72 animate-pulse"></div>
              <div className="h-4 bg-slate-800 rounded w-96 animate-pulse"></div>
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === "card") {
    return (
      <Card className="bg-black border-secondary">
        <CardHeader>
          <div className="h-5 bg-slate-800 rounded w-40 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-6 bg-slate-800 rounded w-24 animate-pulse mb-3"></div>
          <div className="h-4 bg-slate-800 rounded w-32 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return null
}

// Componente de loading simple para usar en cualquier lugar
export function SimpleLoading({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-secondary border-t-purple-500 rounded-full animate-spin`}></div>
    </div>
  )
}

// Componente de loading con texto
export function LoadingWithText({ text = "Loading...", className = "" }: { text?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-8 h-8 border-3 border-secondary border-t-purple-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm font-medium">{text}</p>
    </div>
  )
} 