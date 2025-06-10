// EditableGenkoPreview.tsx

'use client'

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { toHiragana } from 'wanakana'
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
    const totalCells = columns * rows
    const [cells, setCells] = useState<string[]>([])
    const [inputBuffer, setInputBuffer] = useState<string>('')
    const [composeText, setComposeText] = useState<string>('')
    const [composing, setComposing] = useState<boolean>(false)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const cellRefs = useRef<Array<HTMLInputElement | null>>([])

    const [formatting, setFormatting] = useState<CellFormatting>({
        bold: new Set(),
        italic: new Set(),
    })

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

    // Commit a final kana/kanji character into the cell
    function commitChar(i: number, char: string) {
        const updated = [...cells]
        updated[i] = char || '　'
        setCells(updated)
        notifyParent(updated)
        setInputBuffer('')
        setComposeText('')
        advanceFocus(i)
    }

    // Show intermediate romaji/kana/IME buffer in-cell
    function showInterim(i: number, buf: string) {
        const updated = [...cells]
        updated[i] = buf || '　'
        setCells(updated)
    }

    // Handle ASCII romaji input when not composing
    const handleCellChange = (index: number, raw: string) => {
        if (composing) {
            setComposeText(raw)
            showInterim(index, raw)
            return
        }
        const last = raw.slice(-1)
        if (!/^[A-Za-z]$/.test(last)) {
            // direct kana or other char
            commitChar(index, last)
            return
        }
        const newBuf = (inputBuffer + last).toLowerCase()
        setInputBuffer(newBuf)
        const kana = toHiragana(newBuf)
        if (kana !== newBuf) {
            commitChar(index, kana)
        } else {
            showInterim(index, newBuf)
        }
    }

    // Handle backspace & navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (composing) return
        const row = Math.floor(index / columns)
        const col = index % columns
        switch (e.key) {
            case 'Backspace':
                if (inputBuffer) {
                    const buf = inputBuffer.slice(0, -1)
                    setInputBuffer(buf)
                    showInterim(index, buf)
                    e.preventDefault()
                } else if (cells[index] !== '　') {
                    const updated = [...cells]
                    updated[index] = '　'
                    setCells(updated)
                    notifyParent(updated)
                    e.preventDefault()
                } else {
                    // navigate back & clear prev
                    if (row > 0) {
                        const prev = index - columns
                        const updated = [...cells]
                        updated[prev] = '　'
                        setCells(updated)
                        notifyParent(updated)
                        setFocusedIndex(prev)
                        cellRefs.current[prev]?.focus()
                        e.preventDefault()
                    } else if (col > 0) {
                        const prev = index + columns * (rows - 1) - 1
                        const updated = [...cells]
                        updated[prev] = '　'
                        setCells(updated)
                        notifyParent(updated)
                        setFocusedIndex(prev)
                        cellRefs.current[prev]?.focus()
                        e.preventDefault()
                    }
                }
                break
            case 'ArrowRight':
                if (col > 0) {
                    const ni = index - 1
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                } else if (row > 0) {
                    const ni = (row - 1) * columns + (columns - 1)
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                }
                break
            case 'ArrowLeft':
                if (col < columns - 1) {
                    const ni = index + 1
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                } else if (row < rows - 1) {
                    const ni = (row + 1) * columns
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                }
                break
            case 'ArrowDown':
                if (row < rows - 1) {
                    const ni = index + columns
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                }
                break
            case 'ArrowUp':
                if (row > 0) {
                    const ni = index - columns
                    setFocusedIndex(ni)
                    cellRefs.current[ni]?.focus()
                }
                break
        }
    }
    console.log("inputBuffer", inputBuffer)
    console.log("composeText", composeText)
    console.log("composing", composing)
    console.log("focusedIndex", focusedIndex)


    return (
        <div className="editable-genko-container">
            <div className="editable-genko-wrapper">
                <div
                    className="editable-genko-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        direction: 'rtl',
                    }}
                >
                    {cells.map((ch, i) => (
                        <input
                            key={i}
                            ref={el => (cellRefs.current[i] = el)}
                            type="text"
                            value={
                                composing && focusedIndex === i
                                    ? composeText
                                    : focusedIndex === i && inputBuffer
                                        ? inputBuffer
                                        : ch
                            }
                            onFocus={() => setFocusedIndex(i)}
                            onChange={e => handleCellChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, i)}
                            onCompositionStart={() => {
                                console.log("onCompositionStart")
                                setComposing(true)
                            }}
                            onCompositionUpdate={e => {
                                console.log("onCompositionUpdate")
                                const v = e.currentTarget.value
                                setComposeText(v)
                                showInterim(i, v)
                            }}
                            onCompositionEnd={e => {
                                console.log("onCompositionEnd")
                                setComposing(false)
                                commitChar(i, e.currentTarget.value)
                            }}
                            className={
                                `editable-genko-cell` +
                                `${focusedIndex === i ? ' editable-genko-cell--focused' : ''}` +
                                `${formatting.bold.has(i) ? ' editable-genko-cell--bold' : ''}` +
                                `${formatting.italic.has(i) ? ' editable-genko-cell--italic' : ''}`
                            }
                            maxLength={rows}
                        />
                    ))}
                </div>

                {showFoldMarker && <GenkoCenterFoldMarker columns={columns} />}
            </div>
        </div>
    )
}
