'use client'
import TextEditor from '@/components/TextEditor'
import RichTextEditor from '@/components/RichTextEditor'
// import { useState } from 'react'
// import { Editor } from '@tinymce/tinymce-react'

export default function EditorPage() {
    return (
        <main className="min-h-screen p-6 bg-grey-100">
            <h1 className="text-2xl font-bold mb-6">よみかえ</h1>
            <div className="flex">
                <div className="w-1/2">
                    <RichTextEditor/>
                </div>
            </div>
        </main>
    )
}
/*
Why use <main>, <h1>, and these Tailwind classes?

- <main>: Defines the main content area for accessibility and SEO.
- <h1>: Main page title, used once per page for clarity and structure.
- Tailwind classes:
  - min-h-screen: Full viewport height for layout consistency
  - p-6: Adds padding for readable spacing
  - bg-gray-100: Light background for contrast
  - text-xl, font-bold, mb-4: Styles the heading to stand out

These choices improve structure, readability, and user experience.
*/
