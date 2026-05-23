'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ArrowLeft, Upload, Loader2, Check, Package } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function OCRPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      alert('解析に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!result) return
    setLoading(true)

    const { error } = await supabase.from('parts').insert([
      {
        vin: result.vin || null,
        part_number: result.part_number,
        part_name: result.part_name,
        spec: result.spec || null,
        category: result.category || null,
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
          <Camera size={24} />
          写真で登録
        </h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors h-64"
          >
            <Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">写真を撮る・または選択</p>
            <p className="text-sm text-gray-400 mt-2">車体番号や品番が写るようにしてください</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-full object-contain" />
              <button 
                onClick={() => { setPreview(null); setResult(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                再撮影
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500">AIが解析中...</p>
              </div>
            ) : result && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                  <Package className="text-blue-600" size={20} />
                  解析結果の確認
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">部品名称</label>
                    <input 
                      type="text" 
                      className="w-full border-b py-1 focus:outline-none focus:border-blue-500 font-medium"
                      value={result.part_name}
                      onChange={(e) => setResult({...result, part_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">部品番号</label>
                    <input 
                      type="text" 
                      className="w-full border-b py-1 focus:outline-none focus:border-blue-500 font-mono text-lg font-bold text-blue-600"
                      value={result.part_number}
                      onChange={(e) => setResult({...result, part_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">車体番号</label>
                    <input 
                      type="text" 
                      className="w-full border-b py-1 focus:outline-none focus:border-blue-500"
                      value={result.vin}
                      onChange={(e) => setResult({...result, vin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase">スペック</label>
                    <input 
                      type="text" 
                      className="w-full border-b py-1 focus:outline-none focus:border-blue-500"
                      value={result.spec}
                      onChange={(e) => setResult({...result, spec: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleRegister}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  <Check size={20} />
                  この内容で登録する
                </button>
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
