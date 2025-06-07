'use client'

import React from 'react'

interface Props {
    columns: number
}

export default function GenkoCenterFoldMarker({ columns }: Props) {
    if (columns % 2 !== 0) return null

    const midCol = columns / 2

    return (
        <>
            {/* Fold Gutter */}
            <div
                className="absolute top-0 bottom-0 bg-white z-10"
                style={{
                    left: `calc(${midCol * (100 / columns)}%)`,
                    width: '12px',
                    transform: 'translateX(-50%)',
                }}
            />

            {/* Top Arc */}
            <div
                className="absolute z-20 text-green-400 text-[22px] leading-none"
                style={{
                    left: `calc(${midCol * (100 / columns)}%)`,
                    top: '18px',
                    transform: 'translateX(-50%)',
                    fontFamily: 'serif',
                    pointerEvents: 'none',
                }}
            >
                ︵
            </div>

            {/* Bottom Arc */}
            <div
                className="absolute z-20 text-green-400 text-[22px] leading-none"
                style={{
                    left: `calc(${midCol * (100 / columns)}%)`,
                    bottom: '18px',
                    transform: 'translateX(-50%) rotate(180deg)',
                    fontFamily: 'serif',
                    pointerEvents: 'none',
                }}
            >
                ︵
            </div>
        </>
    )
}
