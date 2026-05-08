import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useCallback, useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { useStore } from '../store'

// ─── CACHE ────────────────────────────────────────────────────────────────────
const CACHE = {}
const TTL   = 3 * 60 * 60 * 1000

function getCached(id) {
  const c = CACHE[id]
  if (!c || Date.now() - c.ts > TTL) { delete CACHE[id]; return null }
  return c.url
}
function setCache(id, url) { CACHE[id] = { url, ts: Date.now() } }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  s = Math.floor(s)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const YT_API_KEY = 'AIzaSyAikcQPNqDcjdLwhcQQLJOIX7tZkIQHDaI'


const COBALT_INSTANCES = [
  'https://api.cobalt.tools',
  'https://cobalt.api.timelessnesses.me',
  'https://cobalt.drgns.space',
  'https://capi.oak.li',
]

// ─── FETCH CON TIMEOUT ────────────────────────────────────────────────────────
function fetchWithTimeout(url, ms = 12000, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

// ─── YOUTUBE SEARCH ───────────────────────────────────────────────────────────
export async function searchYouTube(query) {
  if (!YT_API_KEY || YT_API_KEY === 'YOUR_API_KEY') {
    console.warn('[cxmluwu] Falta la YouTube API key en useAudio.js')
    return []
  }
  try {
    const searchRes = await fetchWithTimeout(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(query)}&type=video&` +
      `videoCategoryId=10&maxResults=20&key=${YT_API_KEY}`
    )
    if (!searchRes.ok) {
      const err = await searchRes.json()
      console.error('[YT Search] Error:', err?.error?.message)
      return []
    }
    const searchData = await searchRes.json()
    const items = searchData.items || []
    if (!items.length) return []

    const ids = items.map(i => i.id?.videoId).filter(Boolean).join(',')
    const detailRes = await fetchWithTimeout(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails&id=${ids}&key=${YT_API_KEY}`
    )
    const detailData = detailRes.ok ? await detailRes.json() : { items: [] }
    const detailMap = {}
    for (const v of detailData.items || []) detailMap[v.id] = v

    return items.map(i => {
      const vid = i.id?.videoId || ''
      const iso  = detailMap[vid]?.contentDetails?.duration || ''
      return {
        id:       vid,
        title:    i.snippet?.title || '',
        artist:   i.snippet?.channelTitle || '',
        duration: parseDuration(iso),
        thumb:    i.snippet?.thumbnails?.medium?.url ||
                  i.snippet?.thumbnails?.default?.url || null,
        yt_url:   `https://www.youtube.com/watch?v=${vid}`,
      }
    }).filter(t => t.id)
  } catch (e) {
    console.error('[YT Search] fetch error:', e)
    return []
  }
}

function parseDuration(iso) {
  if (!iso) return 0
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] || 0) * 3600) +
         (parseInt(m[2] || 0) * 60) +
          parseInt(m[3] || 0)
}

// ─── GET STREAM URL (via cobalt.tools) ───────────────────────────────────────
export async function getStreamUrl(ytUrl) {
  const id = ytUrl?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
  if (!id) return null

  const cached = getCached(id)
  if (cached) return cached

  const ytFullUrl = `https://www.youtube.com/watch?v=${id}`

  for (const api of COBALT_INSTANCES) {
    try {
      console.log('[Stream] Intentando cobalt:', api)

      const r = await fetchWithTimeout(api, 12000, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        body: JSON.stringify({
          url:          ytFullUrl,
          downloadMode: 'audio',
          audioFormat:  'best',
        }),
      })

      if (!r.ok) {
        console.log(`[Stream] ${api} -> HTTP ${r.status}`)
        continue
      }

      const data = await r.json()
      console.log('[Stream] cobalt response status:', data.status)

      // cobalt puede devolver url directa o tunnel
      const streamUrl = data.url || data.tunnel

      if (streamUrl) {
        console.log('[Stream] OK desde:', api)
        setCache(id, streamUrl)
        return streamUrl
      }

      // status: 'picker' cuando hay varias opciones (raro para audio)
      if (data.status === 'picker' && data.picker?.length) {
        const picked = data.picker[0]?.url
        if (picked) {
          setCache(id, picked)
          return picked
        }
      }

      console.log('[Stream] cobalt sin URL en respuesta:', JSON.stringify(data).slice(0, 200))

    } catch (e) {
      console.log(`[Stream] ${api} -> error: ${e?.message || e}`)
    }
  }

  console.error('[Stream] Todas las instancias de cobalt fallaron para:', id)
  return null
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const { state, dispatch } = useStore()
  const player    = useAudioPlayer()
  const status    = useAudioPlayerStatus(player)
  const didFinish = useRef(false)
  const activeId  = useRef(null)

  useEffect(() => {
    dispatch({ type: 'SET_PLAYING',  v: status.playing || false })
    dispatch({ type: 'SET_PROGRESS', progress: status.currentTime || 0, duration: status.duration || 0 })
    if (status.didJustFinish && !didFinish.current) {
      didFinish.current = true
      setTimeout(() => { didFinish.current = false; onEnd() }, 200)
    }
  }, [status.playing, status.currentTime, status.duration, status.didJustFinish])

  const onEnd = useCallback(() => {
    if (state.repeatMode === 'one') { player.seekTo(0); player.play(); return }
    nextTrack()
  }, [state.repeatMode])

  const playTrack = useCallback(async (track, idx, pl) => {
    if (!track) return
    const tid = track.id || track.yt_url
    activeId.current = tid
    dispatch({ type: 'SET_LOADING', v: true })
    dispatch({ type: 'SET_TRACK', track, idx })
    if (pl) dispatch({ type: 'SET_CURRENT_PL', v: pl })

    const url = await getStreamUrl(track.yt_url)

    if (activeId.current !== tid) {
      dispatch({ type: 'SET_LOADING', v: false })
      return
    }

    if (!url) {
      dispatch({ type: 'SET_LOADING', v: false })
      Alert.alert(
        'Sin stream',
        `No se pudo cargar "${track.title}".\n\nIntenta con otra canción.`,
        [{ text: 'OK' }]
      )
      return
    }

    try {
      console.log('[Player] Reproduciendo:', track.title)
      player.replace({ uri: url })
      player.play()
    } catch (e) {
      console.error('[Player] Error:', e)
      Alert.alert('Error', `No se pudo reproducir: ${e?.message || e}`)
    }

    dispatch({ type: 'SET_LOADING', v: false })
  }, [player, dispatch])

  const togglePlay = useCallback(() => {
    if (!state.currentTrack) return
    status.playing ? player.pause() : player.play()
  }, [player, status.playing, state.currentTrack])

  const seekTo = useCallback(s => player.seekTo(Math.max(0, s)), [player])

  const nextTrack = useCallback(async () => {
    const { currentPl, currentIdx, isShuffle, repeatMode, queue } = state
    if (queue.length > 0) {
      const [nxt, ...rest] = queue
      dispatch({ type: 'SET_QUEUE', v: rest })
      const i = currentPl?.tracks?.findIndex(t => t.id === nxt.id) ?? -1
      await playTrack(nxt, i)
      return
    }
    if (!currentPl?.tracks?.length) return
    const tracks = currentPl.tracks
    let i = isShuffle ? Math.floor(Math.random() * tracks.length) : currentIdx + 1
    if (i >= tracks.length) { if (repeatMode === 'all') i = 0; else return }
    await playTrack(tracks[i], i)
  }, [state, dispatch, playTrack])

  const prevTrack = useCallback(async () => {
    const { currentPl, currentIdx, repeatMode } = state
    if (!currentPl?.tracks?.length) return
    if ((status.currentTime || 0) > 3) { seekTo(0); return }
    let i = currentIdx - 1
    if (i < 0) i = repeatMode === 'all' ? currentPl.tracks.length - 1 : 0
    await playTrack(currentPl.tracks[i], i)
  }, [state, status.currentTime, seekTo, playTrack])

  return { playTrack, togglePlay, seekTo, nextTrack, prevTrack }
}