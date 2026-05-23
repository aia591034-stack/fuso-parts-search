'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Camera, Plus, Package, Settings } from 'lucide-react'
import Link from 'next/link'

type Part = {
  id: string
  vin: string | null
  part_number: string
  part_name: string
  spec: string | null
  category: string | null
  quantity: number
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
      .order('created_at', { ascending: true }) // 登録順に表示
      .limit(100) // 上限を100件に拡大

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Compact */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Package size={20} />
            ふそう部品検索
          </h1>
          <div className="flex gap-1 items-center">
            <Link href="/admin" className="p-2 hover:bg-blue-700 rounded-lg transition-colors" title="マスター管理">
              <Settings size={20} />
            </Link>
            <Link href="/register/bulk" className="p-2 hover:bg-blue-700 rounded-lg transition-colors" title="一括登録">
              <Plus size={20} />
            </Link>
            <Link href="/ocr" className="p-2 hover:bg-blue-700 rounded-lg transition-colors" title="写真で登録">
              <Camera size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-2 py-4">
        {/* Search Bar - Fixed at top of main */}
        <div className="sticky top-[60px] z-10 pb-4 bg-gray-50">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="車体番号、品名、スペックなどで検索"
              className="block w-full pl-10 pr-3 py-3 border-2 border-transparent bg-white rounded-xl shadow-sm focus:border-blue-500 focus:ring-0 text-lg outline-none transition-all text-black font-bold placeholder:text-gray-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results - Compact List View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500 bg-white">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p>検索中...</p>
            </div>
          ) : parts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {/* Table Header for Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                <div className="col-span-1 text-center">個数</div>
                <div className="col-span-4">部品名称</div>
                <div className="col-span-4">部品番号</div>
                <div className="col-span-3 text-right">車体番号 / スペック</div>
              </div>

              {parts.map((part) => (
                <div key={part.id} className="flex md:grid md:grid-cols-12 gap-3 px-3 py-2 md:py-3 hover:bg-blue-50/50 transition-colors items-center">
                  {/* Quantity - Left on mobile, Column 1 on desktop */}
                  <div className="flex-shrink-0 w-10 md:w-full md:col-span-1 text-center">
                    <span className={`inline-flex items-center justify-center w-full rounded-lg font-black ${part.quantity > 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'} text-base py-1.5 md:py-1`}>
                      {part.quantity}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 md:hidden">個</span>
                  </div>
                  
                  {/* Name & Number Container - Right of quantity on mobile */}
                  <div className="flex-1 md:col-span-8 grid md:grid-cols-8 gap-1 md:gap-2">
                    <div className="md:col-span-4">
                      <p className="font-bold text-gray-900 text-sm md:text-base leading-tight">{part.part_name}</p>
                      <p className="text-[10px] text-gray-400 md:hidden">{part.category || '部品'}</p>
                    </div>
                    <div className="md:col-span-4">
                      <p className="font-mono text-blue-700 font-bold text-sm md:text-base tracking-tight">{part.part_number}</p>
                    </div>
                  </div>

                  {/* VIN & Spec - Bottom/Right */}
                  <div className="hidden md:block md:col-span-3 text-right">
                    {part.vin && (
                      <p className="text-[11px] text-gray-500 font-medium">{part.vin}</p>
                    )}
                    {part.spec && (
                      <p className="text-[10px] text-blue-500 italic truncate">{part.spec}</p>
                    )}
                  </div>
                  
                  {/* Mobile Spec/VIN - small badge style */}
                  <div className="md:hidden flex flex-col items-end gap-1">
                    {part.vin && <span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded">{part.vin.slice(-4)}</span>}
                    {part.spec && <span className="text-[9px] text-blue-400 italic">{part.spec}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-10 text-gray-400 bg-white italic">
              該当する部品が見つかりませんでした
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 bg-white">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>キーワードを入力して検索を開始してください</p>
              <p className="text-xs mt-2 text-gray-300">例: FE638, 電球, 24V, MH...</p>
            </div>
          )}
        </div>
        
        {parts.length > 0 && !loading && (
          <p className="text-center text-[10px] text-gray-400 mt-4">
            全 {parts.length} 件を表示中
          </p>
        )}
      </main>
    </div>
  )
}
