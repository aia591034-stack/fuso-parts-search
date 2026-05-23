'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vin: '',
    part_number: '',
    part_name: '',
    spec: '',
    category: '部品'
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('parts').insert([
      {
        vin: formData.vin || null,
        part_number: formData.part_number,
        part_name: formData.part_name,
        spec: formData.spec || null,
        category: formData.category || null,
      },
    ])

    if (error) {
      alert('登録に失敗しました: ' + error.message)
    } else {
      alert('登録完了しました！')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center gap-4">
        <Link href="/" className="text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} />
          手動データ登録
        </h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">部品名称 *</label>
              <input 
                type="text" 
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例: 電球, ブレーキオイル"
                value={formData.part_name}
                onChange={(e) => setFormData({...formData, part_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">部品番号 *</label>
              <input 
                type="text" 
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="例: MH056202"
                value={formData.part_number}
                onChange={(e) => setFormData({...formData, part_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">車体番号 (任意)</label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例: FE638EV-123456"
                value={formData.vin}
                onChange={(e) => setFormData({...formData, vin: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">スペック (任意)</label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例: 24V 12W, 1L"
                value={formData.spec}
                onChange={(e) => setFormData({...formData, spec: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">カテゴリ</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="部品">部品</option>
                <option value="電球">電球</option>
                <option value="油脂類">油脂類</option>
                <option value="フィルター">フィルター</option>
                <option value="ボルト/ナット">ボルト/ナット</option>
              </select>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-blue-300"
          >
            {loading ? <span className="animate-pulse">登録中...</span> : <><Save size={20} /> 登録する</>}
          </button>
        </form>
      </main>
    </div>
  )
}
