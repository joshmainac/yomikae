'use client'

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'

interface Props {
    markdown: string
}

export default function JapaneseMarkdownPreview({ markdown }: Props) {
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
            className="vertical-jp-preview"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
