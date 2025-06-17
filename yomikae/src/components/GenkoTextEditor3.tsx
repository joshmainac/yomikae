'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import EditableGenkoPreview3 from "./EditableGenkoPreview3"
import GrammarChecker from "./textEditor/grammarChecker"

export default function GenkoTextEditor2() {
    const charLimit = 1000
    const STORAGE_KEY = 'text-editor-content'
    const [pages, setPages] = useState<string[]>([''])
    const [currentPage, setCurrentPage] = useState(0)
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






    const handleTextChange = useCallback((newText: string, pageIndex: number) => {
        setPages(prev => {
            const updated = [...prev]
            updated[pageIndex] = newText
            return updated
        })
    }, [])

    const handlePageChange = useCallback((pageIndex: number) => {
        setPages(prev => {
            if (pageIndex === prev.length - 1) {
                const newPages = [...prev, '']
                setNewPageIndex(newPages.length - 1)
                return newPages
            }
            return prev
        })
    }, [])

    // Create memoized callbacks for each page
    const memoizedCallbacks = useMemo(() => {
        return pages.map((_, index) => ({
            onChange: (text: string) => handleTextChange(text, index),
            onPageChange: () => handlePageChange(index)
        }))
    }, [pages.length, handleTextChange, handlePageChange])

    const handleFocusForIndex = useCallback(
        () => setNewPageIndex(null),
        []
    )




    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col-reverse gap-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                {pages.map((pageText, index) => (
                    <div
                        key={index}
                        className="relative"
                    >
                        {(() => {
                            console.log("render editor3", pageText, index, index === newPageIndex)
                            return null
                        })()}

                        <EditableGenkoPreview3
                            text={pageText}
                            onChange={memoizedCallbacks[index]?.onChange}
                            onPageChange={memoizedCallbacks[index]?.onPageChange}
                            shouldFocus={index === newPageIndex}
                            onFocus={handleFocusForIndex}
                        />

                    </div>
                ))}
            </div>

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
                </div>
            </div>

            <GrammarChecker
                text={pages[currentPage]}
            />
        </div>
    )
}