'use client'

import { createContext, useContext, useState } from 'react'
import { SpeedTestResult } from '@/lib/types'

type HistoryContextType = {
  history: SpeedTestResult[]
  addToHistory: (result: SpeedTestResult) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<SpeedTestResult[]>([])

  const addToHistory = (result: SpeedTestResult) => {
    setHistory(prev => [result, ...prev])
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}