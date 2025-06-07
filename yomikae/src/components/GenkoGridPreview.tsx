'use client'

import React from 'react'

interface Props {
    text: string
    columns?: number
    rows?: number
}

export default function GenkoGridPreview({ text, columns = 20, rows = 20 }: Props) {
    const totalCells = columns * rows
    const paddedText = text.padEnd(totalCells, '　') // full-width space

    // Transpose characters: column-first ordering
    const transposed: string[][] = []
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            const i = r + c * rows
            if (!transposed[r]) transposed[r] = []
            transposed[r][c] = paddedText[i]
        }
    }

    // Flatten the grid row by row (but visually column by column)
    const flattened = transposed.flat()

    return (
        <div
            className="genko-grid"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                width: `${columns * 30}px`,
                height: `${rows * 30}px`,
                border: '1px solid #aaa',
                direction: 'rtl', 
            }}
        >
            {flattened.map((char, i) => (
                <div key={i} className="genko-cell">
                    {char}
                </div>
            ))}
        </div>
    )
}
