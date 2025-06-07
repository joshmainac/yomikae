'use client'

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'

interface Props {
    markdown: string
}

export default function RichJapaneseMarkdownPreview({ markdown }: Props) {
    const [html, setHtml] = useState<string>('')

    useEffect(() => {
        const renderMarkdown = async () => {
            const rawHtml = await marked(markdown)
            const safeHtml = DOMPurify.sanitize(rawHtml)
            setHtml(safeHtml)
        }

        renderMarkdown()
    }, [markdown])

    return (
        <div className="flex justify-center items-center">
            <div
                className="vertical-jp-preview-rich"
                style={{
                    fontFamily: '"Yu Mincho", "Noto Serif JP", serif',
                }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

