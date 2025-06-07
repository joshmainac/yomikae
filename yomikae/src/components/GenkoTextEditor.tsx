'use client'

import { useEffect, useState, useRef } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import MarkdownPreview from "./MarkdownPreview"
import JapaneseMarkdownPreview from "./JapaneseMarkdownPreview"
import RichJapaneseMarkdownPreview from "./RichJapaneseMarkdownPreview"
import GenkoGridPreview from "./GenkoGridPreview"
import GenkoMultiPagePreview from "./GenkoMultiPagePreview"


export default function GenkoTextEditor() {
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [text, setText] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    const handleBold = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        // If no text is selected, do nothing
        if (start === end) return

        const before = text.slice(0, start)
        const selected = text.slice(start, end)
        const after = text.slice(end)

        const newText = `${before}**${selected}**${after}`
        setText(newText)

        // Maintain selection after state update
        requestAnimationFrame(() => {
            textarea.focus()
            textarea.setSelectionRange(start + 2, end + 2)
        })
    }


    return (
        <div className="flex flex-row gap-4">
            {/* <MarkdownPreview markdown={text} />
            <JapaneseMarkdownPreview markdown={text} />
            <GenkoGridPreview text={text} /> */}
            {/* //Todo multi page sometime disappears and do not handle spaces */}
            <div className="">
                <GenkoMultiPagePreview text={text} />
            </div>
            <div className="w-full">
                <textarea
                    ref={textareaRef}
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

                <button
                    onClick={handleBold}
                    disabled={!text}
                    className="block mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200"
                >
                    太字
                </button>

            </div>
            {/* //Todo bold now working anymore */}


        </div>
    )
}