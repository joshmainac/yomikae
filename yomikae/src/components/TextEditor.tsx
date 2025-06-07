'use client'

import { useEffect, useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"


export default function TextEditor(){
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [text, setText] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)

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

    const handleGrammerCheck = async () => {
        setLoading(true)
        setSuggestion('')
        try {
            const res = await fetch('/api/grammar-check',
                {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify({text}),
                }
            )
            const data = await res.json()
            setSuggestion(data.suggestion || '文法チェックに失敗しました')

        } catch (error) {
            console.error('文法チェックエラー:', error)
            setSuggestion('文法チェックに失敗しました')
        } finally {
            setLoading(false)
        }
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
                className="block mt-4 text-red-600 hover:text-red-800 underline transition-colors duration-200"
            >
                クリア
            </button>

            <button
                onClick={handleGrammerCheck}
                disabled={!text || loading}
                className="block mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
                {loading ? '文法チェック中...' : '文法チェック'}
            </button>
            

            {suggestion && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md">
                    <h2 className="text-lg font-bold mb-2">文法チェック結果</h2>
                    <p className="text-sm text-gray-600">{suggestion}</p>
                </div>
            )}

            <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">よみかえ</h2>
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    )
}