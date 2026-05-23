'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type BulkPart = {
  part_number: string
  part_name: string
  quantity: number
}

export default function BulkRegisterPage() {
  const [vin, setVin] = useState('')
  const [parts, setParts] = useState<BulkPart[]>([{ part_number: '', part_name: '', quantity: 1 }])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addRow = () => {
    setParts([...parts, { part_number: '', part_name: '', quantity: 1 }])
  }

  const removeRow = (index: number) => {
    if (parts.length === 1) return
    setParts(parts.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: keyof BulkPart, value: string | number) => {
    const newParts = [...parts]
    newParts[index] = { ...newParts[index], [field]: value }
    setParts(newParts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const insertData = parts
      .filter(p => p.part_number && p.part_name)
      .map(p => ({
        vin: vin || null,
        part_number: p.part_number,
        part_name: p.part_name,
        quantity: p.quantity,
        category: '部品'
      }))

    if (insertData.length === 0) {
      alert('有効な部品情報を入力してください')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('parts').insert(insertData)

    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert(`${insertData.length}件の部品を登録しました`)
      router.push('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/admin" className="text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-800">一括登録</h1>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-24">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">共通の車体番号 (VIN)</label>
          <input 
            type="text" 
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            placeholder="例: FE638EV-123456"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-gray-400 uppercase">
            <div className="col-span-5">部品名称</div>
            <div className="col-span-4">部品番号</div>
            <div className="col-span-2 text-center">個数</div>
            <div className="col-span-1"></div>
          </div>

          {parts.map((part, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="col-span-1 md:col-span-5">
                <label className="block md:hidden text-xs text-gray-400 font-bold mb-1">部品名称</label>
                <input 
                  type="text" 
                  className="w-full border-b py-1 focus:border-blue-500 outline-none"
                  value={part.part_name}
                  onChange={(e) => updateRow(idx, 'part_name', e.target.value)}
                  placeholder="例: オイルシール"
                />
              </div>
              <div className="col-span-1 md:col-span-4">
                <label className="block md:hidden text-xs text-gray-400 font-bold mb-1">部品番号</label>
                <input 
                  type="text" 
                  className="w-full border-b py-1 focus:border-blue-500 outline-none font-mono"
                  value={part.part_number}
                  onChange={(e) => updateRow(idx, 'part_number', e.target.value)}
                  placeholder="例: MH034180"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block md:hidden text-xs text-gray-400 font-bold mb-1">個数</label>
                <input 
                  type="number" 
                  className="w-full border-b py-1 focus:border-blue-500 outline-none text-center"
                  value={part.quantity}
                  onChange={(e) => updateRow(idx, 'quantity', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1 md:col-span-1 flex justify-end">
                <button onClick={() => removeRow(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addRow}
          className="w-full mt-6 border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Plus size={20} /> 行を追加する
        </button>

        <div className="fixed bottom-6 left-4 right-4 max-w-4xl mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Save size={20} /> {loading ? '登録中...' : 'マスターに一括登録する'}
          </button>
        </div>
      </main>
    </div>
  )
}
