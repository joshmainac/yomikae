'use client'
import GenkoTextEditor2 from '@/components/GenkoTextEditor2'
// import { useState } from 'react'
// import { Editor } from '@tinymce/tinymce-react'

export default function GenkoTextEditor2Page() {
    return (
        <main className="min-h-screen p-6 bg-grey-100">
            <h1 className="text-2xl font-bold mb-6">よみかえ</h1>
            <div className="flex flex-col">
                <div className="w-full">
                    <GenkoTextEditor2 />
                </div>
            </div>
        </main>
    )
}
