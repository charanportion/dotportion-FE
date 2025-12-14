"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Check } from "lucide-react"

interface JsonSchemaEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string
}

export function JsonSchemaEditor({ value, onChange, height = "200px" }: JsonSchemaEditorProps) {
  const [editorValue, setEditorValue] = useState(value || "")
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    setEditorValue(value || "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setEditorValue(newValue)

    try {
      if (newValue.trim()) {
        JSON.parse(newValue)
      }
      setIsValid(true)
      setErrorMessage("")
      onChange(newValue)
    } catch (error) {
      setIsValid(false)
      setErrorMessage(error instanceof Error ? error.message : "Invalid JSON")
    }
  }

  const formatJson = () => {
    try {
      if (editorValue.trim()) {
        const formatted = JSON.stringify(JSON.parse(editorValue), null, 2)
        setEditorValue(formatted)
        setIsValid(true)
        setErrorMessage("")
        onChange(formatted)
      }
    } catch (error) {
      setIsValid(false)
      setErrorMessage(error instanceof Error ? error.message : "Invalid JSON")
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={editorValue}
          onChange={handleChange}
          className={`w-full font-mono text-sm p-2 rounded-md border ${
            isValid ? "border-input" : "border-red-500"
          } bg-background`}
          style={{ height }}
          placeholder='{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  },
  "required": ["name"]
}'
        />
        <div className="absolute top-2 right-2">
          {isValid ? <Check className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      {!isValid && <div className="text-xs text-red-500">{errorMessage}</div>}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={formatJson}
          className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
        >
          Format JSON
        </button>
      </div>
    </div>
  )
}
