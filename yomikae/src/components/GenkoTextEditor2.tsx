'use client'

import { useEffect, useState, useRef } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import EditableGenkoPreview from "./EditableGenkoPreview"

export default function GenkoTextEditor2() {
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [text, setText] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)
    console.log("old text", text)

    //Load saved text from local storage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            setText(saved)
        }
    }, [])

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
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ text }),
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

    const handleTextChange = (newText: string) => {
        console.log("!newText", newText)
        setText(newText)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {text.length}/{charLimit}文字
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleClear}
                        className="px-3 py-1 text-red-600 hover:text-red-800 underline transition-colors duration-200"
                    >
                        クリア
                    </button>
                    <button
                        onClick={handleGrammerCheck}
                        disabled={!text || loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                    >
                        {loading ? '文法チェック中...' : '文法チェック'}
                    </button>
                </div>
            </div>

            {suggestion && (
                <div className="bg-gray-100 p-4 rounded-md">
                    <h2 className="text-lg font-bold mb-2">文法チェック結果</h2>
                    <p className="text-sm text-gray-600">{suggestion}</p>
                </div>
            )}

            <EditableGenkoPreview
                text={text}
                onChange={handleTextChange}
            />
        </div>
    )
}