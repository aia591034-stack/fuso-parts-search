'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (item: any) => void
  placeholder?: string
  column: 'vin' | 'part_number' | 'part_name'
  className?: string
  inputClassName?: string
}

export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder,
  column,
  inputClassName
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      
      // ユニークな候補を取得するためのクエリ
      // 今回は簡易的に、対象カラムで検索して最新の10件を取得
      let query = supabase
        .from('parts')
        .select('*')
        .ilike(column, `%${value}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      const { data, error } = await query
      
      if (!error && data) {
        // 表示用に重複をある程度排除（完全なユニーク化はSupabaseのselect('distinct')が使えないためJS側で）
        const unique = data.filter((v, i, a) => 
          a.findIndex(t => t[column] === v[column]) === i
        )
        setSuggestions(unique)
        setIsOpen(unique.length > 0)
      }
      setLoading(false)
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [value, column])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className={inputClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true)
        }}
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="animate-spin text-gray-400" size={16} />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              className="w-full text-left px-4 py-4 hover:bg-blue-50 active:bg-blue-100 border-b border-gray-50 last:border-none flex flex-col transition-colors"
              onClick={() => {
                onSelect(item)
                setIsOpen(false)
              }}
            >
              <span className="font-bold text-gray-900 text-base">
                {item[column]}
              </span>
              {column === 'part_number' && (
                <span className="text-sm text-gray-500">{item.part_name}</span>
              )}
              {column === 'part_name' && (
                <span className="text-xs font-mono text-blue-600 font-bold">{item.part_number}</span>
              )}
              {column === 'vin' && item.part_name && (
                <span className="text-sm text-gray-500">{item.part_name} <span className="text-xs font-mono">({item.part_number})</span></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
