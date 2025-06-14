'use client'

import { useEffect, useState, useRef } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import EditableGenkoPreview3 from "./EditableGenkoPreview3"

export default function GenkoTextEditor2() {
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [pages, setPages] = useState<string[]>([''])
    const [currentPage, setCurrentPage] = useState(0)
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [newPageIndex, setNewPageIndex] = useState<number | null>(null)

    //Load saved text from local storage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const savedPages = JSON.parse(saved)
                setPages(savedPages)
            } catch {
                // If parsing fails, treat as single page
                setPages([saved])
            }
        }
    }, [])

    //auto save to local storage as user types
    useAutoSave(STORAGE_KEY, JSON.stringify(pages))

    const handleClear = () => {
        setPages([''])
        setCurrentPage(0)
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
                    body: JSON.stringify({ text: pages[currentPage] }),
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

    const handleTextChange = (newText: string, pageIndex: number) => {
        const newPages = [...pages]
        newPages[pageIndex] = newText
        setPages(newPages)
    }

    const handlePageChange = (pageIndex: number) => {
        // Add a new page if we're at the last page
        if (pageIndex === pages.length - 1) {
            const newPages = [...pages, '']
            setPages(newPages)
            setNewPageIndex(newPages.length - 1)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {pages[currentPage].length}/{charLimit}文字
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
                        disabled={!pages[currentPage] || loading}
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

            <div className="flex flex-col-reverse gap-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                {pages.map((pageText, index) => (
                    <div
                        key={index}
                        className="relative"
                    >
                        <div className="absolute top-0 right-0 text-sm text-gray-500">
                            ページ {index + 1} / {pages.length}
                        </div>
                        <EditableGenkoPreview3
                            text={pageText}
                            onChange={(text) => handleTextChange(text, index)}
                            onPageChange={() => handlePageChange(index)}
                            shouldFocus={index === newPageIndex}
                            onFocus={() => setNewPageIndex(null)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}