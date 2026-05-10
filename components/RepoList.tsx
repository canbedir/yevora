'use client'

import { useState, useMemo, useEffect } from 'react'
import { GitHubRepo } from '@/types/github'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, CircleDot, ExternalLink } from 'lucide-react'

// Helper for relative time
function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  
  const days = Math.floor(diffInSeconds / 86400)
  if (days > 0) return rtf.format(-days, 'day')
  
  const hours = Math.floor(diffInSeconds / 3600)
  if (hours > 0) return rtf.format(-hours, 'hour')
  
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes > 0) return rtf.format(-minutes, 'minute')
  
  return rtf.format(-diffInSeconds, 'second')
}

// Helper for language badge colors
function getLanguageColor(lang: string) {
  const normalized = lang.toLowerCase()
  switch (normalized) {
    case 'typescript': return 'bg-blue-500 hover:bg-blue-600 text-white'
    case 'javascript': return 'bg-yellow-400 hover:bg-yellow-500 text-black'
    case 'python': return 'bg-green-500 hover:bg-green-600 text-white'
    case 'go': return 'bg-cyan-500 hover:bg-cyan-600 text-white'
    case 'rust': return 'bg-orange-500 hover:bg-orange-600 text-white'
    default: return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  }
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export function RepoList({ repos }: { repos: GitHubRepo[] }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  const [language, setLanguage] = useState('all')
  const [sortBy, setSortBy] = useState('updated')

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>()
    repos.forEach(r => {
      if (r.language) langs.add(r.language)
    })
    return Array.from(langs).sort()
  }, [repos])

  const filteredAndSortedRepos = useMemo(() => {
    let result = [...repos]

    // Filter by search
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase()
      result = result.filter(r => 
        r.name.toLowerCase().includes(lowerSearch) || 
        (r.description && r.description.toLowerCase().includes(lowerSearch))
      )
    }

    // Filter by language
    if (language !== 'all') {
      result = result.filter(r => r.language === language)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
      if (sortBy === 'stars') {
        return b.stargazers_count - a.stargazers_count
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [repos, debouncedSearch, language, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Search repositories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-4 sm:w-auto w-full">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {uniqueLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="stars">Most stars</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSortedRepos.map((repo) => (
          <Card key={repo.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-base font-semibold leading-tight break-all">
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary flex items-center gap-1.5"
                  >
                    {repo.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  {repo.private && (
                    <Badge variant="outline" className="font-normal text-xs">Private</Badge>
                  )}
                  {repo.language && (
                    <Badge className={`font-normal text-xs border-transparent ${getLanguageColor(repo.language)}`}>
                      {repo.language}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="line-clamp-2 text-sm mt-2 min-h-[40px]">
                {repo.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0 pb-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CircleDot className="h-3.5 w-3.5" />
                  <span>{repo.open_issues_count}</span>
                </div>
                <div className="ml-auto" suppressHydrationWarning>
                  Updated {getRelativeTime(repo.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredAndSortedRepos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No repositories found matching your criteria.
        </div>
      )}
    </div>
  )
}
