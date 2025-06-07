import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const {text} = await req.json()

    if(!text){
        return NextResponse.json({message: "No text provided"}, {status: 400})
    }

    try{
         // Simulate AI suggestion (replace this with real OpenAI call later)
        const suggestion = `※仮のチェック結果※「${text.slice(0, 10)}...」 → 文法的に少し見直すと良いかもしれません。`
        return NextResponse.json({
            message: "Text provided",
            suggestion: suggestion
        }, {status: 200})
    } catch (error) {
        console.error("Error checking grammar:", error)
        return NextResponse.json({message: "Error checking grammar"}, {status: 500})
    }

}
