import { createContext, useContext, useReducer, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Monocromatico - solo grises y blanco como acentos posibles
export const ACCENT_COLORS = [
  { name: 'blanco',  value: '#FFFFFF' },
  { name: 'plata',   value: '#C0C0C0' },
  { name: 'gris',    value: '#888888' },
  { name: 'humo',    value: '#666666' },
  { name: 'carbón',  value: '#444444' },
  { name: 'crema',   value: '#E8E0D0' },
]

const initial = {
  playlists:    [],
  currentPl:    null,
  currentTrack: null,
  currentIdx:   -1,
  isPlaying:    false,
  isShuffle:    false,
  repeatMode:   'off',
  queue:        [],
  progress:     0,
  duration:     0,
  loading:      false,
  accent:       '#FFFFFF',
  profile:      { name: '', email: '' },
}

function reducer(s, a) {
  switch (a.type) {
    case 'SET_PLAYLISTS':  return { ...s, playlists: a.v }
    case 'SET_CURRENT_PL': return { ...s, currentPl: a.v }
    case 'SET_TRACK':      return { ...s, currentTrack: a.track, currentIdx: a.idx }
    case 'SET_PLAYING':    return { ...s, isPlaying: a.v }
    case 'SET_PROGRESS':   return { ...s, progress: a.progress, duration: a.duration }
    case 'SET_SHUFFLE':    return { ...s, isShuffle: a.v }
    case 'SET_REPEAT':     return { ...s, repeatMode: a.v }
    case 'SET_QUEUE':      return { ...s, queue: a.v }
    case 'ADD_QUEUE':      return { ...s, queue: [...s.queue, a.v] }
    case 'SET_LOADING':    return { ...s, loading: a.v }
    case 'SET_ACCENT':     return { ...s, accent: a.v }
    case 'SET_PROFILE':    return { ...s, profile: { ...s.profile, ...a.v } }
    default: return s
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial)

  useEffect(() => {
    AsyncStorage.multiGet(['playlists', 'accent', 'profile']).then(pairs => {
      pairs.forEach(([key, val]) => {
        if (!val) return
        try {
          const parsed = JSON.parse(val)
          if (key === 'playlists') dispatch({ type: 'SET_PLAYLISTS', v: parsed })
          if (key === 'accent')    dispatch({ type: 'SET_ACCENT',    v: parsed })
          if (key === 'profile')   dispatch({ type: 'SET_PROFILE',   v: parsed })
        } catch (_) {}
      })
    })
  }, [])

  useEffect(() => { AsyncStorage.setItem('playlists', JSON.stringify(state.playlists)) }, [state.playlists])
  useEffect(() => { AsyncStorage.setItem('accent',    JSON.stringify(state.accent))    }, [state.accent])
  useEffect(() => { AsyncStorage.setItem('profile',   JSON.stringify(state.profile))   }, [state.profile])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)