'use client'

import React from 'react'
import GenkoGridPreview from './GenkoGridPreview'

interface Props {
    text: string
    columns?: number
    rows?: number
    showFoldMarker?: boolean
}

export default function GenkoMultiPagePreview({
    text,
    columns = 20,
    rows = 20,
    showFoldMarker = false,
}: Props) {
    const charsPerPage = columns * rows
    const pages = []

    for (let i = 0; i < Math.ceil(text.length / charsPerPage); i++) {
        const pageText = text.slice(i * charsPerPage, (i + 1) * charsPerPage)
        pages.push(pageText)
    }

    return (
        <div className="flex flex-col items-center gap-8">
            {pages.map((pageText, index) => (
                <div key={index} className="w-fit">
                    <GenkoGridPreview
                        text={pageText}
                        columns={columns}
                        rows={rows}
                        showFoldMarker={showFoldMarker}
                    />
                    <div className="mt-2 text-sm text-gray-500 text-center">
                        ページ {index + 1}
                    </div>
                </div>
            ))}
        </div>
    )
}
