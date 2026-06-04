import { useContext } from 'react'
import { AppContext } from './appContextObject.js'

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp harus dipakai di dalam AppProvider')
  }

  return context
}
