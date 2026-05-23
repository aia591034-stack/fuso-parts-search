'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ArrowLeft, Upload, Loader2, Check, Package } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function OCRPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setResults([])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(Array.isArray(data) ? data : [data])
    } catch (error: any) {
      alert('解析に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterAll = async () => {
    if (results.length === 0) return
    setLoading(true)

    const insertData = results.map(r => ({
      vin: r.vin || null,
      part_number: r.part_number,
      part_name: r.part_name,
      spec: r.spec || null,
      category: r.category || '部品',
    }))

    const { error } = await supabase.from('parts').insert(insertData)

    if (error) {
      alert('登録に失敗しました: ' + error.message)
    } else {
      alert(`${results.length}件の部品を登録しました！`)
      router.push('/')
    }
    setLoading(false)
  }

  const updateResult = (index: number, field: string, value: string) => {
    const newResults = [...results]
    newResults[index] = { ...newResults[index], [field]: value }
    setResults(newResults)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center gap-4">
        <Link href="/" className="text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Camera size={24} />
          写真で一括登録
        </h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors h-64"
          >
            <Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">リストの写真を撮る</p>
            <p className="text-sm text-gray-400 mt-2">複数の部品を一度に読み込めます</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-full object-contain" />
              <button 
                onClick={() => { setPreview(null); setResults([]); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                再撮影
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500">AIがリストを読み取り中...</p>
              </div>
            ) : results.length > 0 && (
              <div className="space-y-4 pb-24">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  読み取り結果 ({results.length}件)
                </h3>
                
                {results.map((result, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">部品名称</label>
                        <input 
                          type="text" 
                          className="w-full border-b py-1 focus:outline-none focus:border-blue-500 font-medium"
                          value={result.part_name}
                          onChange={(e) => updateResult(idx, 'part_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase">部品番号</label>
                        <input 
                          type="text" 
                          className="w-full border-b py-1 focus:outline-none focus:border-blue-500 font-mono font-bold text-blue-600"
                          value={result.part_number}
                          onChange={(e) => updateResult(idx, 'part_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase">車体番号</label>
                        <input 
                          type="text" 
                          className="w-full border-b py-1 focus:outline-none focus:border-blue-500 text-sm"
                          value={result.vin}
                          onChange={(e) => updateResult(idx, 'vin', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto">
                  <button 
                    onClick={handleRegisterAll}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-blue-700"
                  >
                    <Check size={20} />
                    {results.length}件すべて登録する
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
        />
      </main>
    </div>
  )
}
