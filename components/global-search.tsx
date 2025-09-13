"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { SearchIcon, XIcon, FileTextIcon, BuildingIcon, UserIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Función debounce simple
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface SearchResult {
  id: string
  type: "report" | "workgroup" | "user"
  title: string
  description: string
  url: string
  metadata?: {
    status?: string
    date?: string
    participants?: number
    role?: string
  }
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Atajo de teclado para abrir búsqueda (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Cerrar búsqueda con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        setQuery("")
        setResults([])
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Click fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery("")
        setResults([])
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const searchData = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const [reportsRes, workgroupsRes, usersRes] = await Promise.all([
        fetch(`/api/reports?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/workgroups?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`)
      ])

      const reports = await reportsRes.json()
      const workgroups = await workgroupsRes.json()
      const users = await usersRes.json()

      const searchResults: SearchResult[] = [
        ...reports.map((report: any) => ({
          id: report.id,
          type: "report" as const,
          title: `${report.workGroup.name} - Q${report.quarter} ${report.year}`,
          description: `Quarterly report with ${report.participants.length} participants`,
          url: `/dashboard/quarterly-reports/${report.id}`,
          metadata: {
            status: report.consensusStatus,
            date: new Date(report.createdAt).toLocaleDateString(),
            participants: report.participants.length
          }
        })),
        ...workgroups.map((workgroup: any) => ({
          id: workgroup.id,
          type: "workgroup" as const,
          title: workgroup.name,
          description: workgroup.missionStatement,
          url: `/dashboard/workgroups/${workgroup.id}`,
          metadata: {
            status: workgroup.status,
            participants: workgroup.totalMembers
          }
        })),
        ...users.map((user: any) => ({
          id: user.id,
          type: "user" as const,
          title: user.name,
          description: user.email,
          url: `/dashboard/profile/${user.id}`,
          metadata: {
            role: user.role
          }
        }))
      ]

      setResults(searchResults.slice(0, 8)) // Limitar a 8 resultados
    } catch (error) {
      console.error("Error searching:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Debouncing para evitar requests excesivos
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchData(query), 300),
    []
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    debouncedSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "report":
        return <FileTextIcon className="h-4 w-4" />
      case "workgroup":
        return <BuildingIcon className="h-4 w-4" />
      case "user":
        return <UserIcon className="h-4 w-4" />
      default:
        return <FileTextIcon className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "report":
        return "bg-blue-500/10 text-blue-300 border-secondary"
      case "workgroup":
        return "bg-purple-500/10 text-purple-300 border-secondary"
      case "user":
        return "bg-green-500/10 text-green-300 border-secondary"
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "CONSENSED":
        return "bg-green-500/20 text-green-300"
      case "IN_CONSENSUS":
        return "bg-yellow-500/20 text-yellow-300"
      case "PENDING":
        return "bg-blue-500/20 text-blue-300"
      case "Active":
        return "bg-green-500/20 text-green-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Botón de búsqueda */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="w-32 sm:w-48 justify-start text-gray-400 hover:text-white border-secondary hover:border-gray-500"
      >
        <SearchIcon className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate hidden sm:inline">Search...</span>
        <Badge variant="outline" className="ml-auto text-xs shrink-0">
          ⌘K
        </Badge>
      </Button>

      {/* Modal de búsqueda */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl mx-4">
            <Card className="bg-black border-secondary shadow-2xl">
              <CardContent className="p-0">
                {/* Input de búsqueda */}
                <div className="flex items-center gap-2 p-4 border-b border-secondary">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search reports, workgroups, users..."
                    className="border-0 bg-transparent text-white placeholder:text-gray-400 focus:ring-0"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuery("")
                        setResults([])
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Resultados */}
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="p-2">
                      {results.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            index === selectedIndex
                              ? "bg-purple-600/20 border border-secondary"
                              : "hover:bg-black/50 border border-transparent"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white truncate">
                                {result.title}
                              </h4>
                              {result.metadata?.status && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getStatusColor(result.metadata.status)}`}
                                >
                                  {result.metadata.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {result.description}
                            </p>
                            {result.metadata?.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {result.metadata.date}
                              </p>
                            )}
                          </div>

                          <ArrowRightIcon className="h-4 w-4 text-gray-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : query.length >= 2 ? (
                    <div className="p-4 text-center text-gray-400">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      Start typing to search...
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-secondary bg-black/50">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Use ↑↓ to navigate, Enter to select</span>
                    <span>Press Esc to close</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 