"use client"

import { Play } from "lucide-react"

interface WorkflowRunButtonProps {
  onClick: () => void
  isRunning: boolean
}

export function WorkflowRunButton({ onClick, isRunning }: WorkflowRunButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isRunning}
      className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isRunning ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Running...
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          Run Workflow
        </>
      )}
    </button>
  )
}
