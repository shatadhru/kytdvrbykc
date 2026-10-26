'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CourseFiltersProps {
  categories: { id: string; title: string; slug?: string }[]
  selectedCategory?: string
  initialSearch?: string
}

export function CourseFilters({
  categories,
  selectedCategory = 'all',
  initialSearch = '',
}: CourseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = React.useState(initialSearch)

  // Keep state in sync if URL search param changes from outside
  React.useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  // Automatic search with 350ms debounce
  React.useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    if (searchTerm.trim() === currentQ.trim()) return

    const timer = setTimeout(() => {
      updateFilters(undefined, searchTerm)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm, searchParams])

  const updateFilters = (newCategory?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    const cat = newCategory !== undefined ? newCategory : (searchParams.get('category') || 'all')
    const q = newSearch !== undefined ? newSearch : searchTerm

    if (cat && cat !== 'all') {
      params.set('category', cat)
    } else {
      params.delete('category')
    }

    if (q && q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters(undefined, searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    updateFilters(undefined, '')
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Button
          type="button"
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => updateFilters('all', undefined)}
          className="rounded-full text-xs"
        >
          সকল কোর্স
        </Button>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id || selectedCategory === cat.slug
          return (
            <Button
              key={cat.id}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => updateFilters(cat.slug || cat.id, undefined)}
              className="rounded-full text-xs"
            >
              {cat.title}
            </Button>
          )
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="কোর্স খুঁজুন..."
          className="pl-9 pr-8 h-9 text-xs rounded-full bg-background"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </form>
    </div>
  )
}

