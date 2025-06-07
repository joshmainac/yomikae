'use client'

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import GenkoCenterFoldMarker from './GenkoCenterFoldMarker'

interface CellFormatting {
    bold: Set<number>
    italic: Set<number>
}

interface Props {
    text: string
    columns?: number
    rows?: number
    showFoldMarker?: boolean
    onChange?: (text: string) => void
}

export default function EditableGenkoPreview({
    text,
    columns = 20,
    rows = 20,
    showFoldMarker = false,
    onChange,
}: Props) {
    const [cells, setCells] = useState<string[]>([])
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const cellRefs = useRef<(HTMLInputElement | null)[]>([])

    const [formatting, setFormatting] = useState<CellFormatting>({
        bold: new Set(),
        italic: new Set(),
    })
    console.log("EditableGenkoPreview text", text)

    // Initialize cells from text prop
    useEffect(() => {
        const totalCells = columns * rows
        const paddedText = text.padEnd(totalCells, '　') // full-width space

        // Create grid array (row-major order)
        const gridArray = new Array(totalCells).fill('　')

        // Fill grid array from text (which is in column-major order)
        for (let i = 0; i < paddedText.length; i++) {
            const col = Math.floor(i / rows)
            const row = i % rows
            const gridIndex = row * columns + col
            gridArray[gridIndex] = paddedText[i]
        }

        setCells(gridArray)
    }, [text, columns, rows])

    // Handle cell value change
    const handleCellChange = (index: number, value: string) => {
        const newCells = [...cells]
        // Only take the first character if multiple characters are pasted
        newCells[index] = value.slice(-1) || '　'
        setCells(newCells)

        // Notify parent of text change
        if (onChange) {
            // Convert grid order (row-major) to text order (column-major)
            const textArray = new Array(cells.length).fill('　')
            for (let i = 0; i < cells.length; i++) {
                const row = Math.floor(i / columns)
                const col = i % columns
                const textIndex = col * rows + row
                textArray[textIndex] = newCells[i]
            }
            onChange(textArray.join('').trimEnd())
        }

        // Auto-advance to next cell
        if (value && index < cells.length - 1) {
            const nextIndex = index + 1
            setFocusedIndex(nextIndex)
            cellRefs.current[nextIndex]?.focus()
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        const row = Math.floor(index / columns)
        const col = index % columns

        switch (e.key) {
            case 'ArrowRight': // Move to previous column (right in vertical writing)
                if (col > 0) {
                    const newIndex = index - 1
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                } else if (row > 0) {
                    // Wrap to previous row, rightmost column
                    const newIndex = (row - 1) * columns + (columns - 1)
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                }
                break
            case 'ArrowLeft': // Move to next column (left in vertical writing)
                if (col < columns - 1) {
                    const newIndex = index + 1
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                } else if (row < rows - 1) {
                    // Wrap to next row, leftmost column
                    const newIndex = (row + 1) * columns
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                }
                break
            case 'ArrowDown': // Move down in the same column
                if (row < rows - 1) {
                    const newIndex = index + columns
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                }
                break
            case 'ArrowUp': // Move up in the same column
                if (row > 0) {
                    const newIndex = index - columns
                    setFocusedIndex(newIndex)
                    cellRefs.current[newIndex]?.focus()
                }
                break
        }
    }

    // Formatting methods (placeholder for now)
    const getFormatting = (): CellFormatting => formatting

    const setBold = (index: number, bold: boolean) => {
        const newBold = new Set(formatting.bold)
        if (bold) {
            newBold.add(index)
        } else {
            newBold.delete(index)
        }
        setFormatting({ ...formatting, bold: newBold })
    }

    const setItalic = (index: number, italic: boolean) => {
        const newItalic = new Set(formatting.italic)
        if (italic) {
            newItalic.add(index)
        } else {
            newItalic.delete(index)
        }
        setFormatting({ ...formatting, italic: newItalic })
    }

    return (
        <div className="editable-genko-container">
            <div className="editable-genko-wrapper">
                {/* Main Grid */}
                <div
                    className="editable-genko-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        direction: 'rtl',
                    }}
                >
                    {cells.map((char, i) => (
                        <input
                            key={i}
                            ref={el => {
                                cellRefs.current[i] = el
                            }}
                            type="text"
                            value={char}
                            onChange={(e) => handleCellChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className={`editable-genko-cell ${focusedIndex === i ? 'editable-genko-cell--focused' : ''
                                } ${formatting.bold.has(i) ? 'editable-genko-cell--bold' : ''} ${formatting.italic.has(i) ? 'editable-genko-cell--italic' : ''
                                }`}
                            maxLength={1}
                        />
                    ))}
                </div>

                {/* Optional Fold Marker */}
                {showFoldMarker && <GenkoCenterFoldMarker columns={columns} />}
            </div>
        </div>
    )
} 