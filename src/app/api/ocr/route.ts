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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    const prompt = `
      この画像から「車体番号(VIN)」「部品番号(Part Number)」「部品名称(Part Name)」「スペック(Spec)」を抽出してください。
      回答は以下のJSON形式のみで返してください。
      {
        "vin": "見つかった車体番号、なければ空文字列",
        "part_number": "見つかった部品番号、なければ空文字列",
        "part_name": "部品の名前（電球、ブレーキオイルなど）、推測できればその名前",
        "spec": "電圧、電力、容量などのスペック情報",
        "category": "部品のカテゴリ（電球、油脂類、エンジン部品など）"
      }
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
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const partData = JSON.parse(cleanedJson)

    return NextResponse.json(partData)
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: '画像の解析に失敗しました' }, { status: 500 })
  }
}
