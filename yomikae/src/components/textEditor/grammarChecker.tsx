'use client'

import { useState } from 'react'

interface GrammarCheckerProps {
    text: string
}

export default function GrammarChecker({ text }: GrammarCheckerProps) {
    const [loading, setLoading] = useState(false)
    const [suggestion, setSuggestion] = useState('')

    const handleGrammarCheck = async () => {
        setLoading(true)
        setSuggestion('') // Clear previous suggestion
        try {
            const res = await fetch('/api/grammar-check', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ text }),
            })
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
        <div className="flex flex-col gap-2 items-end justify-end">
            <button
                onClick={handleGrammarCheck}
                disabled={!text || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
            >
                {loading ? '文法チェック中...' : '文法チェック'}
            </button>

            {suggestion && (
                <div className="mt-2 bg-gray-100 p-4 rounded-md">
                    <h2 className="text-lg font-bold mb-2">文法チェック結果</h2>
                    <p className="text-sm text-gray-600">{suggestion}</p>
                </div>
            )}
        </div>
    )
}



