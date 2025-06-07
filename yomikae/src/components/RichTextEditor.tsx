'use client'

import { useEffect, useState } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function RichTextEditor() {
  const charLimit = 1000
  const STORAGE_KEY = 'rich-text-editor-content'
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      localStorage.setItem(STORAGE_KEY, html)
    },
  })

  // Load saved content on first mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (editor && saved) {
      editor.commands.setContent(saved)
    }
  }, [editor])

  const handleClear = () => {
    editor?.commands.clearContent()
    localStorage.removeItem(STORAGE_KEY)
    setSuggestion('')
  }

  const handleGrammarCheck = async () => {
    if (!editor) return
    setLoading(true)
    setSuggestion('')
    const text = editor.getText()

    try {
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setSuggestion(data.suggestion || '文法チェックに失敗しました')
    } catch (error) {
      console.error('文法チェックエラー:', error)
      setSuggestion('文法チェックに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="border border-gray-300 rounded-md p-2 min-h-[200px] bg-white">
        {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
      </div>

      <div className="text-sm text-right mt-2 text-gray-600">
        {editor?.getText().length || 0}/{charLimit}文字
      </div>

      <button
        onClick={handleClear}
        className="block mt-4 text-red-600 hover:text-red-800 underline transition-colors duration-200"
      >
        クリア
      </button>

      <button
        onClick={handleGrammarCheck}
        disabled={!editor || !editor.getText().trim() || loading}
        className="block mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
      >
        {loading ? '文法チェック中...' : '文法チェック'}
      </button>

      {suggestion && (
        <div className="mt-4 bg-gray-100 p-4 rounded-md">
          <h2 className="text-lg font-bold mb-2">文法チェック結果</h2>
          <p className="text-sm text-gray-600">{suggestion}</p>
        </div>
      )}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 border rounded ${editor?.isActive('bold') ? 'bg-gray-300' : ''}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 border rounded ${editor?.isActive('italic') ? 'bg-gray-300' : ''}`}
        >
          Italic
        </button>
      </div>




      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">よみかえ</h2>
        <p className="text-sm text-gray-600">{editor?.getText()}</p>
      </div>
    </div>
  )
}
