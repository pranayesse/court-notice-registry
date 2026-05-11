'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface CaseSearchBarProps {
  defaultValue?: string
  size?: 'default' | 'lg'
}

export default function CaseSearchBar({ defaultValue = '', size = 'default' }: CaseSearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, CNR number, or employer..."
        className={size === 'lg' ? 'h-12 text-base' : ''}
      />
      <Button type="submit" className={size === 'lg' ? 'h-12 px-6' : ''}>
        <Search size={size === 'lg' ? 20 : 16} />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
