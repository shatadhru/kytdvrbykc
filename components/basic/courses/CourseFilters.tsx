'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CourseFiltersProps {
  categories: { id: string; title: string; slug?: string }[]
  selectedCategory?: string
  initialSearch?: string
  priceFilter?: string
  sortOrder?: string
}

export function CourseFilters({
  categories,
  selectedCategory = 'all',
  initialSearch = '',
  priceFilter = 'all',
  sortOrder = 'newest',
}: CourseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = React.useState(initialSearch)

  // Keep state in sync if URL search param changes from outside
  React.useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  const currentPrice = searchParams.get('price') || priceFilter
  const currentSort = searchParams.get('sort') || sortOrder

  const updateFilters = ({
    newCategory,
    newSearch,
    newPrice,
    newSort,
  }: {
    newCategory?: string
    newSearch?: string
    newPrice?: string
    newSort?: string
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    const cat = newCategory !== undefined ? newCategory : (searchParams.get('category') || 'all')
    const q = newSearch !== undefined ? newSearch : searchTerm
    const pr = newPrice !== undefined ? newPrice : (searchParams.get('price') || 'all')
    const s = newSort !== undefined ? newSort : (searchParams.get('sort') || 'newest')

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

    if (pr && pr !== 'all') {
      params.set('price', pr)
    } else {
      params.delete('price')
    }

    if (s && s !== 'newest') {
      params.set('sort', s)
    } else {
      params.delete('sort')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Automatic search with 350ms debounce
  React.useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    if (searchTerm.trim() === currentQ.trim()) return

    const timer = setTimeout(() => {
      updateFilters({ newSearch: searchTerm })
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm, searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ newSearch: searchTerm })
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    updateFilters({ newSearch: '' })
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        <Button
          type="button"
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => updateFilters({ newCategory: 'all' })}
          className="rounded-full text-xs font-semibold shrink-0 h-8 px-4 cursor-pointer"
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
              onClick={() => updateFilters({ newCategory: cat.slug || cat.id })}
              className="rounded-full text-xs font-semibold shrink-0 h-8 px-4 cursor-pointer"
            >
              {cat.title}
            </Button>
          )
        })}
      </div>

      {/* Search & Filter Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="কোর্স খুঁজুন..."
            className="pl-9 pr-8 h-9 text-xs rounded-lg bg-background"
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

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Price Filter Segmented Toggle */}
          <div className="inline-flex items-center rounded-lg bg-muted/70 p-1 border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => updateFilters({ newPrice: 'all' })}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all font-medium cursor-pointer',
                currentPrice === 'all'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              সকল কোর্স
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ newPrice: 'paid' })}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all font-medium cursor-pointer',
                currentPrice === 'paid'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              পেইড কোর্স
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ newPrice: 'free' })}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all font-medium cursor-pointer',
                currentPrice === 'free'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              ফ্রি ক্লাস
            </button>
          </div>

          {/* Sort Selector */}
          <div className="w-44 sm:w-48">
            <Select
              value={currentSort}
              onValueChange={(val) => {
                if (typeof val === 'string') {
                  updateFilters({ newSort: val })
                }
              }}
            >
              <SelectTrigger className="w-full h-9 text-xs bg-background">
                <SelectValue placeholder="সর্ট করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">নতুন কোর্স</SelectItem>
                  <SelectItem value="price-asc">মূল্য: কম থেকে বেশি</SelectItem>
                  <SelectItem value="price-desc">মূল্য: বেশি থেকে কম</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
