import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { useState, useRef } from 'react'
import { useStore } from '../store'
import { useAudio, searchYouTube, fmt } from '../hooks/useAudio'
import { MiniPlayer } from '../components/MiniPlayer'
import { Search, Music, Plus } from '../components/Icons'

// Inline key warning banner
function ApiKeyWarning() {
  return (
    <View style={w.banner}>
      <Text style={w.line}>{'╔══════════════════════════════╗'}</Text>
      <Text style={w.line}>{'║  WARN: YT_API_KEY no config  ║'}</Text>
      <Text style={w.line}>{'║  edita hooks/useAudio.js     ║'}</Text>
      <Text style={w.line}>{'╚══════════════════════════════╝'}</Text>
    </View>
  )
}
const w = StyleSheet.create({
  banner: { alignItems: 'center', paddingVertical: 20, gap: 1 },
  line: { color: '#2a2a2a', fontSize: 10, fontFamily: 'monospace' },
})

export default function SearchTab() {
  const { state, dispatch } = useStore()
  const { playTrack } = useAudio()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [noKey, setNoKey]       = useState(false)
  const inputRef = useRef(null)
  const { accent, playlists } = state

  const doSearch = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    setNoKey(false)
    const res = await searchYouTube(q)
    if (res === null || (Array.isArray(res) && res.length === 0 && q)) {
      // Might be missing key
    }
    setResults(res || [])
    setLoading(false)
    // Detect missing key via empty response
    if (!res || res.length === 0) setNoKey(true)
  }

  const playNow = (track) => {
    const tempPl = { id: 'search_results', name: 'Búsqueda', tracks: results, photo: null }
    dispatch({ type: 'SET_CURRENT_PL', v: tempPl })
    playTrack(track, results.findIndex(t => t.id === track.id), tempPl)
  }

  const addToPlaylist = (track) => {
    if (!playlists.length) {
      Alert.alert(
        'SIN PLAYLISTS',
        '¿Crear una nueva?',
        [
          { text: 'Crear', onPress: () => createAndAdd(track) },
          { text: 'Cancelar', style: 'cancel' },
        ]
      )
      return
    }
    Alert.alert(
      'AGREGAR A PLAYLIST',
      'Elige destino:',
      [
        ...playlists.map(pl => ({
          text: pl.name,
          onPress: () => {
            const updated = playlists.map(p =>
              p.id === pl.id
                ? {
                    ...p,
                    tracks: [
                      ...(p.tracks || []),
                      { ...track, id: track.id || `t_${Date.now()}` },
                    ],
                  }
                : p
            )
            dispatch({ type: 'SET_PLAYLISTS', v: updated })
            Alert.alert('OK', `"${track.title}" → ${pl.name}`)
          },
        })),
        { text: 'Nueva playlist', onPress: () => createAndAdd(track) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    )
  }

  const createAndAdd = (track) => {
    Alert.prompt?.(
      'NUEVA PLAYLIST',
      'Nombre:',
      name => {
        if (!name?.trim()) return
        const pl = {
          id: `pl_${Date.now()}`,
          name: name.trim(),
          photo: null,
          tracks: [{ ...track, id: track.id || `t_${Date.now()}` }],
        }
        dispatch({ type: 'SET_PLAYLISTS', v: [...playlists, pl] })
        Alert.alert('OK', `Playlist "${pl.name}" creada`)
      }
    ) ?? Alert.alert('AVISO', 'Ve a Biblioteca → Nueva playlist primero')
  }

  const addToQueue = (track) => {
    dispatch({ type: 'ADD_QUEUE', v: { ...track, id: track.id || `t_${Date.now()}` } })
    Alert.alert('COLA', `"${track.title}" agregada`)
  }

  const renderResult = ({ item: track, index: i }) => {
    const isActive = state.currentTrack?.id === track.id
    return (
      <TouchableOpacity
        style={[s.row, isActive && { borderLeftColor: accent }]}
        onPress={() => playNow(track)}
        onLongPress={() =>
          Alert.alert(track.title, track.artist, [
            { text: 'Reproducir',         onPress: () => playNow(track) },
            { text: 'Agregar a playlist', onPress: () => addToPlaylist(track) },
            { text: 'Agregar a la cola',  onPress: () => addToQueue(track) },
            { text: 'Cancelar',           style: 'cancel' },
          ])
        }
        activeOpacity={0.7}
      >
        <Text style={[s.rowIdx, isActive && { color: accent }]}>
          {String(i + 1).padStart(2, '0')}
        </Text>
        {track.thumb
          ? <Image source={{ uri: track.thumb }} style={s.thumb} />
          : (
            <View style={[s.thumb, s.thumbPh]}>
              <Music size={14} color="#252525" />
            </View>
          )
        }
        <View style={s.info}>
          <Text
            style={[s.title, isActive && { color: accent }]}
            numberOfLines={2}
          >
            {track.title}
          </Text>
          <Text style={s.meta} numberOfLines={1}>
            {track.artist}  ·  {fmt(track.duration)}
          </Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => addToPlaylist(track)}>
          <Text style={[s.addTxt, { color: accent }]}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={s.root}>
      {/* Search bar */}
      <View style={s.topBar}>
        <Text style={s.prompt}>$</Text>
        <TextInput
          ref={inputRef}
          style={s.input}
          placeholder="buscar en youtube..."
          placeholderTextColor="#252525"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
          autoCapitalize="none"
          selectionColor={accent}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => { setQuery(''); setResults([]); setSearched(false); setNoKey(false) }}
          >
            <Text style={s.clearTxt}>×</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.searchBtn, { borderColor: accent + '88' }]}
          onPress={doSearch}
        >
          <Text style={[s.searchBtnTxt, { color: accent }]}>EXEC</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Results area */}
      {loading
        ? (
          <View style={s.center}>
            <ActivityIndicator color={accent} size="small" />
            <Text style={s.hint}>BUSCANDO...</Text>
          </View>
        )
        : !searched
          ? (
            <View style={s.center}>
              <Text style={[s.bigGlyph, { color: accent + '22' }]}>⌕</Text>
              <Text style={s.hint}>busca canciones, artistas{'\n'}o álbumes en youtube</Text>
            </View>
          )
          : results.length === 0
            ? (
              <View style={s.center}>
                {noKey && <ApiKeyWarning />}
                <Text style={s.hint}>SIN RESULTADOS</Text>
                <Text style={s.hintSmall}>
                  {noKey
                    ? 'Verifica tu YT_API_KEY en useAudio.js'
                    : 'Intenta con otra búsqueda'}
                </Text>
              </View>
            )
            : (
              <FlatList
                data={results}
                keyExtractor={(t, i) => (t.id || '') + i}
                renderItem={renderResult}
                contentContainerStyle={{ paddingBottom: 160 }}
                ListHeaderComponent={() => (
                  <Text style={s.resultCount}>
                    {results.length} RESULTADOS
                  </Text>
                )}
              />
            )
      }
      <MiniPlayer />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 58,
    paddingBottom: 10,
  },
  prompt: {
    color: '#2a2a2a',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    color: '#aaa',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.5,
    paddingVertical: 6,
  },
  clearTxt: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'monospace',
    paddingHorizontal: 4,
  },
  searchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchBtnTxt: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#111',
    marginHorizontal: 14,
    marginBottom: 2,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },
  bigGlyph: {
    fontSize: 64,
    fontFamily: 'monospace',
  },
  hint: {
    color: '#2a2a2a',
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 18,
  },
  hintSmall: {
    color: '#1e1e1e',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  resultCount: {
    color: '#1e1e1e',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 3,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#0d0d0d',
  },
  rowIdx: {
    color: '#1e1e1e',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 20,
    textAlign: 'right',
  },
  thumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
  },
  thumbPh: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  info: { flex: 1, minWidth: 0, gap: 3 },
  title: {
    color: '#777',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  meta: {
    color: '#2e2e2e',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  addBtn: { padding: 8 },
  addTxt: {
    fontSize: 20,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
})