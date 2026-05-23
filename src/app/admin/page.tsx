'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Camera, Plus, Package, Edit2, Trash2, ArrowLeft, Check, X } from 'lucide-react'
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

export default function AdminPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Part>>({})

  const fetchParts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('parts').select('*').order('created_at', { ascending: false })
    
    if (searchQuery) {
      query = query.or(`vin.ilike.%${searchQuery}%,part_name.ilike.%${searchQuery}%,part_number.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) console.error(error)
    else setParts(data || [])
    setLoading(false)
  }, [searchQuery])

  useEffect(() => {
    fetchParts()
  }, [fetchParts])

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return
    const { error } = await supabase.from('parts').delete().eq('id', id)
    if (error) alert('削除失敗: ' + error.message)
    else fetchParts()
  }

  const startEdit = (part: Part) => {
    setEditingId(part.id)
    setEditForm(part)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    const { error } = await supabase.from('parts').update(editForm).eq('id', editingId)
    if (error) alert('更新失敗: ' + error.message)
    else {
      setEditingId(null)
      fetchParts()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600"><ArrowLeft size={24} /></Link>
          <h1 className="text-xl font-bold text-gray-800">マスター管理</h1>
        </div>
        <Link href="/register/bulk" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> 一括登録
        </Link>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="マスター内を検索 (車体番号、部品番号など)"
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">部品名称 / 番号</th>
                <th className="px-6 py-4">車体番号</th>
                <th className="px-6 py-4">個数</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">読み込み中...</td></tr>
              ) : parts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">データがありません</td></tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === part.id ? (
                        <div className="space-y-2">
                          <input 
                            className="w-full border-b focus:border-blue-500 outline-none font-bold"
                            value={editForm.part_name || ''}
                            onChange={(e) => setEditForm({...editForm, part_name: e.target.value})}
                          />
                          <input 
                            className="w-full border-b focus:border-blue-500 outline-none text-sm font-mono text-blue-600"
                            value={editForm.part_number || ''}
                            onChange={(e) => setEditForm({...editForm, part_number: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-800">{part.part_name}</p>
                          <p className="text-sm font-mono text-blue-600">{part.part_number}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === part.id ? (
                        <input 
                          className="w-full border-b focus:border-blue-500 outline-none text-sm"
                          value={editForm.vin || ''}
                          onChange={(e) => setEditForm({...editForm, vin: e.target.value})}
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{part.vin || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === part.id ? (
                        <input 
                          type="number"
                          className="w-16 border-b focus:border-blue-500 outline-none text-center"
                          value={editForm.quantity || 1}
                          onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                        />
                      ) : (
                        <span className="font-bold text-orange-600">{part.quantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === part.id ? (
                          <>
                            <button onClick={handleUpdate} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={20} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(part)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={20} /></button>
                            <button onClick={() => handleDelete(part.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
