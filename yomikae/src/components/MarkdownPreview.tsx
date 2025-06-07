'use client'

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'

interface Props {
    markdown: string
}

export default function MarkdownPreview({ markdown }: Props) {
    const [html, setHtml] = useState<string>('')

    useEffect(() => {
        const renderMarkdown = async () => {
            const rawHtml = await marked(markdown) // ✅ await required
            const safeHtml = DOMPurify.sanitize(rawHtml)
            setHtml(safeHtml)
        }

        renderMarkdown()
    }, [markdown])
    

    return (
        <div
            className="prose prose-sm max-w-none mt-4 p-4 bg-gray-50 border rounded"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
