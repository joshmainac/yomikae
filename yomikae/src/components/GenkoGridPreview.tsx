'use client'

import React from 'react'
import GenkoCenterFoldMarker from './GenkoCenterFoldMarker'

interface Props {
    text: string
    columns?: number
    rows?: number
    showFoldMarker?: boolean
}

export default function GenkoGridPreview({
    text,
    columns = 20,
    rows = 20,
    showFoldMarker = false,
}: Props) {
    const totalCells = columns * rows
    const paddedText = text.padEnd(totalCells, '　') // full-width space

    // Transpose: column-first flow
    const transposed: string[][] = []
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            const i = r + c * rows
            if (!transposed[r]) transposed[r] = []
            transposed[r][c] = paddedText[i]
        }
    }

    const flattened = transposed.flat()

    return (
        <div className="genko-page">
            <div className="relative">
                {/* Main Grid */}
                <div
                    className="genko-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        direction: 'rtl',
                    }}
                >
                    {flattened.map((char, i) => (
                        <div key={i} className="genko-cell">
                            {char}
                        </div>
                    ))}
                </div>

                {/* Optional Fold Marker - Still under development */}
                {showFoldMarker && <GenkoCenterFoldMarker columns={columns} />}
            </div>
        </div>
    )
}
