import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-8b'
    })

    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    const prompt = `
      この画像は自動車部品のリスト（納品書やパーツリスト）です。
      画像全体を解析し、記載されている「車体番号(VIN)」と「すべての部品情報」を抽出してください。
      
      抽出ルール:
      1. 画像の上部などに「車体番号(VIN)」があれば、すべての部品に対して同じVINを付与してください。
      2. 表形式の場合、すべての行を読み取ってください。
      3. 部品番号、部品名称、スペック、カテゴリを抽出してください。
      
      回答は必ず以下のJSON配列形式のみで返してください。余計な説明は不要です:
      [
        {
          "vin": "車体番号",
          "part_number": "部品番号",
          "part_name": "部品名称",
          "spec": "スペック情報",
          "category": "カテゴリ"
        }
      ]
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ])

    const responseText = result.response.text()
    // 堅牢なJSON抽出
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    const cleanedJson = jsonMatch ? jsonMatch[0] : responseText
    const partsData = JSON.parse(cleanedJson)

    return NextResponse.json(partsData)
  } catch (error: any) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: '解析失敗: ' + (error.message || '不明なエラー') }, { status: 500 })
  }
}
