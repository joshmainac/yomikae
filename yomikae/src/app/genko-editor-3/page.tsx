'use client'
import GenkoTextEditor3 from '@/components/GenkoTextEditor3'
// import { useState } from 'react'
// import { Editor } from '@tinymce/tinymce-react'

export default function GenkoTextEditor2Page() {
    return (
        <main className="min-h-screen p-6 bg-grey-100">
            <h1 className="text-2xl font-bold mb-6">よみかえ</h1>
            <div className="flex flex-col">
                <div className="w-full">
                    <GenkoTextEditor3 />
                </div>
            </div>
        </main>
    )
}
