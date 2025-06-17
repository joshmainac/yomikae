// EditableGenkoPreview.tsx

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
    onPageChange?: () => void
    shouldFocus?: boolean
    onFocus?: () => void
}

function EditableGenkoPreview({
    text,
    columns = 20,
    rows = 20,
    showFoldMarker = false,
    onChange,
    onPageChange,
    shouldFocus = false,
    onFocus,
}: Props) {
    const totalCells = columns * rows
    const [cells, setCells] = useState<string[]>([])
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const [focusedColumn, setFocusedColumn] = useState<number | null>(null)
    const cellRefs = useRef<Array<HTMLInputElement | null>>([])
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const [formatting, setFormatting] = useState<CellFormatting>({
        bold: new Set(),
        italic: new Set(),
    })
    console.log("cells", cells)

    // Initialize grid from `text` (column-major → row-major)
    useEffect(() => {
        const padded = text.padEnd(totalCells, '　')
        const grid = new Array(totalCells).fill('　')
        for (let i = 0; i < padded.length; i++) {
            const col = Math.floor(i / rows)
            const row = i % rows
            grid[row * columns + col] = padded[i]
        }
        setCells(grid)
    }, [text, columns, rows, totalCells])

    useEffect(() => {
        if (focusedColumn !== null && textareaRef.current) {
            textareaRef.current.focus()
            // Load the existing column text into the textarea, trimming trailing spaces
            textareaRef.current.value = getColumnText(focusedColumn).replace(/　+$/, '')
        }
    }, [focusedColumn])

    // Add effect to handle initial focus
    useEffect(() => {
        if (shouldFocus) {
            // Focus on the rightmost column (first in vertical writing)
            setFocusedColumn(columns - 1)
            // Small delay to ensure the textarea is rendered
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    onFocus?.()
                }
            }, 0)
        }
    }, [shouldFocus, columns, onFocus])

    // Get text for a specific column
    const getColumnText = (colIndex: number): string => {
        let text = ''
        for (let row = 0; row < rows; row++) {
            text += cells[row * columns + colIndex]
        }
        return text
    }

    // Update cells in a column with new text
    const updateColumnText = (colIndex: number, text: string) => {
        const updated = [...cells]
        const paddedText = text.padEnd(rows, '　')

        for (let row = 0; row < rows; row++) {
            updated[row * columns + colIndex] = paddedText[row]
        }

        setCells(updated)
        notifyParent(updated)
    }

    // Handle column textarea input
    const handleColumnInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (focusedColumn === null) return
        updateColumnText(focusedColumn, e.target.value)
    }

    // Notify parent with re-serialized text
    function notifyParent(updated: string[]) {
        if (!onChange) return
        const out = new Array(updated.length).fill('　')
        for (let i = 0; i < updated.length; i++) {
            const row = Math.floor(i / columns)
            const col = i % columns
            out[col * rows + row] = updated[i]
        }
        onChange(out.join('').trimEnd())
    }

    // Move focus after committing a character
    function advanceFocus(index: number) {
        const row = Math.floor(index / columns)
        const col = index % columns

        if (row < rows - 1) {
            const next = index + columns
            setFocusedIndex(next)
            cellRefs.current[next]?.focus()
        } else if (col < columns - 1) {
            const next = index + 1 - (rows - 1) * columns
            setFocusedIndex(next)
            cellRefs.current[next]?.focus()
        }
    }

    // Handle cell focus
    const handleCellFocus = (index: number) => {
        const col = index % columns
        setFocusedIndex(index)
        setFocusedColumn(col)
    }

    // Handle textarea key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (focusedColumn === null) return

        if (e.key === 'Enter') {
            e.preventDefault()
            //update text and notify parent
            updateColumnText(focusedColumn, (e.target as HTMLTextAreaElement).value)
            if (focusedColumn !== null && focusedColumn > 0) {
                textareaRef.current?.blur()
                setFocusedColumn(focusedColumn - 1)

            } else if (focusedColumn === 0) {
                // When at the first column, move to the next page
                textareaRef.current?.blur()
                setFocusedColumn(null)
                setFocusedIndex(null)
                onPageChange?.()
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            //update text and notify parent
            updateColumnText(focusedColumn, (e.target as HTMLTextAreaElement).value)
            if (focusedColumn > 0) {
                textareaRef.current?.blur()
                setFocusedColumn(focusedColumn - 1)
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            //update text and notify parent
            updateColumnText(focusedColumn, (e.target as HTMLTextAreaElement).value)
            if (focusedColumn < columns - 1) {
                textareaRef.current?.blur()
                setFocusedColumn(focusedColumn + 1)
            }
        }
    }

    return (
        <div className="editable-genko-container">
            <div className="editable-genko-wrapper">
                <div
                    className="editable-genko-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        direction: 'ltr',
                        position: 'relative',
                    }}
                >
                    {cells.map((ch, i) => (
                        <input
                            key={i}
                            ref={el => {
                                cellRefs.current[i] = el
                            }}
                            type="text"
                            value={ch}
                            readOnly
                            onFocus={() => handleCellFocus(i)}
                            className={`
                                editable-genko-cell
                                ${focusedIndex === i ? 'editable-genko-cell--focused' : ''}
                                ${formatting.bold.has(i) ? 'editable-genko-cell--bold' : ''}
                                ${formatting.italic.has(i) ? 'editable-genko-cell--italic' : ''}
                            `}
                        />
                    ))}

                    {focusedColumn !== null && (
                        <textarea
                            ref={textareaRef}
                            className="editable-genko-column-textarea"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: `${focusedColumn * (100 / columns)}%`,
                                width: `${100 / columns}%`,
                                height: '102%',
                                resize: 'none',
                                background: 'rgba(255, 255, 255, 0.9)',
                                zIndex: 10,
                                padding: '4px',
                                border: '2px solid #000',
                                borderRadius: '4px',
                                writingMode: 'vertical-lr',
                                textOrientation: 'upright',
                                fontSize: '16px',
                                lineHeight: '2.5',
                                letterSpacing: '14px',
                                fontFamily: '"Yu Mincho", "Noto Serif JP", serif',
                            }}
                            // onChange={handleColumnInput}
                            onKeyDown={handleKeyDown}
                            onBlur={() => setFocusedColumn(null)}
                            rows={1}
                            cols={columns}
                            maxLength={rows}
                            wrap="soft"
                        />
                    )}
                </div>

                {showFoldMarker && <GenkoCenterFoldMarker columns={columns} />}
            </div>
        </div>
    )
}

export default React.memo(EditableGenkoPreview, (prevProps, nextProps) => {
    // Debug logging to see what's changing
    const changed = {
        text: prevProps.text !== nextProps.text,
        onChange: prevProps.onChange !== nextProps.onChange,
        onPageChange: prevProps.onPageChange !== nextProps.onPageChange,
        shouldFocus: prevProps.shouldFocus !== nextProps.shouldFocus,
        onFocus: prevProps.onFocus !== nextProps.onFocus,
        columns: prevProps.columns !== nextProps.columns,
        rows: prevProps.rows !== nextProps.rows,
        showFoldMarker: prevProps.showFoldMarker !== nextProps.showFoldMarker,
    }
    
    const hasChanges = Object.values(changed).some(Boolean)
    if (hasChanges) {
        console.log('EditableGenkoPreview props changed:', changed, 'text:', prevProps.text.slice(0, 10))
    }
    
    return !hasChanges
})
