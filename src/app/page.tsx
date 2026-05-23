'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Camera, Plus, Package } from 'lucide-react'
import Link from 'next/link'

type Part = {
  id: string
  vin: string | null
  part_number: string
  part_name: string
  spec: string | null
  category: string | null
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setParts([])
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .or(`vin.ilike.%${searchQuery}%,part_name.ilike.%${searchQuery}%,spec.ilike.%${searchQuery}%,part_number.ilike.%${searchQuery}%`)
      .limit(50)

    if (error) {
      console.error(error)
    } else {
      setParts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Package size={24} />
            ふそう部品検索
          </h1>
          <div className="flex gap-2">
            <Link href="/register" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Plus size={24} />
            </Link>
            <Link href="/ocr" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Camera size={24} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="車体番号、品名(電球など)、スペック(24Vなど)で検索"
            className="block w-full pl-10 pr-3 py-4 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">検索中...</div>
          ) : parts.length > 0 ? (
            parts.map((part) => (
              <div key={part.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-800">{part.part_name}</h2>
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                    {part.category || '部品'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">部品番号</p>
                    <p className="font-mono text-lg font-bold text-blue-600">{part.part_number}</p>
                  </div>
                  {part.vin && (
                    <div>
                      <p className="text-gray-500">車体番号</p>
                      <p className="font-medium text-gray-800">{part.vin}</p>
                    </div>
                  )}
                  {part.spec && (
                    <div className="col-span-2">
                      <p className="text-gray-500">スペック</p>
                      <p className="font-medium text-gray-800">{part.spec}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : query ? (
            <div className="text-center py-10 text-gray-500">該当する部品が見つかりませんでした</div>
          ) : (
            <div className="text-center py-10 text-gray-500">検索キーワードを入力してください</div>
          )}
        </div>
      </main>
    </div>
  )
}
