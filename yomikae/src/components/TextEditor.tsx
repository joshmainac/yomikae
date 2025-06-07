'use client'

import { useEffect, useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"


export default function TextEditor(){
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [text, setText] = useState('')

    //Load saved text from local storage
    useEffect(()=>{
        const saved = localStorage.getItem(STORAGE_KEY)
        if(saved){
            setText(saved)
        }
    },[])

    //auto save to local storage as user types
    useAutoSave(STORAGE_KEY, text)

    const handleClear = () => {
        setText("")
        localStorage.removeItem(STORAGE_KEY)
    }

    return (
        <div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="テキストを入力してください"
                className="w-full h-64 p-4 text-base border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* character count */}
            <div className="text-sm text-right mt-2 text-gray-600">
                {text.length}/{charLimit}文字
            </div>

            <button
                onClick={handleClear}
                className="text-red-600 hover:text-red-800 underline transition-colors duration-200"
            >
                クリア
            </button>

            <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">よみかえ</h2>
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    )
}