import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, Alert,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useAudio } from '../hooks/useAudio'
import { ChevronLeft, Music, Shuffle, Repeat, Timer } from '../components/Icons'

export default function QueueScreen({ navigation }) {
  const { state, dispatch } = useStore()
  const { playTrack } = useAudio()
  const {
    currentTrack, currentPl, queue,
    isShuffle, repeatMode, isPlaying, currentIdx, accent,
  } = state

  const [sleepMins, setSleepMins] = useState(0)
  const [sleepTimer, setSleepTimer] = useState(null)
  const OPTS = [0, 5, 10, 15, 30, 45, 60]

  const handleTimer = () => {
    const next = OPTS[(OPTS.indexOf(sleepMins) + 1) % OPTS.length]
    setSleepMins(next)
    if (sleepTimer) clearTimeout(sleepTimer)
    if (next > 0) {
      setSleepTimer(
        setTimeout(() => {
          dispatch({ type: 'SET_PLAYING', v: false })
          setSleepMins(0)
        }, next * 60000)
      )
    }
  }

  useEffect(() => () => { if (sleepTimer) clearTimeout(sleepTimer) }, [sleepTimer])

  const upNext = currentPl?.tracks?.slice(currentIdx + 1, currentIdx + 9) || []

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={20} color="#555" />
        </TouchableOpacity>
        <Text style={[s.headerTxt, { color: accent }]}>COLA DE REPRODUCCIÓN</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={s.divider} />

      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <>
            {currentTrack && (
              <>
                <Text style={s.lbl}>// AHORA</Text>
                <View style={[s.row, s.rowNow, { borderLeftColor: accent }]}>
                  {currentTrack.thumb
                    ? <Image source={{ uri: currentTrack.thumb }} style={s.thumb} />
                    : (
                      <View style={[s.thumb, s.thumbPh]}>
                        <Music size={12} color="#1e1e1e" />
                      </View>
                    )
                  }
                  <View style={s.info}>
                    <Text style={[s.title, { color: accent }]} numberOfLines={1}>
                      {currentTrack.title}
                    </Text>
                    <Text style={s.artist} numberOfLines={1}>
                      {currentTrack.artist}
                    </Text>
                  </View>
                  <Text style={[s.nowTag, { color: accent }]}>
                    {isPlaying ? '▶' : '⏸'}
                  </Text>
                </View>
              </>
            )}
            {queue.length > 0 && <Text style={s.lbl}>// EN COLA</Text>}
          </>
        )}
        data={queue}
        keyExtractor={(t, i) => t.id + i}
        renderItem={({ item: track, index: i }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => {
              const q = [...queue]
              q.splice(i, 1)
              dispatch({ type: 'SET_QUEUE', v: q })
              playTrack(track, currentPl?.tracks?.findIndex(t => t.id === track.id) ?? -1)
            }}
            onLongPress={() =>
              Alert.alert(track.title, '', [
                {
                  text: 'Quitar de la cola',
                  onPress: () => {
                    const q = [...queue]
                    q.splice(i, 1)
                    dispatch({ type: 'SET_QUEUE', v: q })
                  },
                },
                { text: 'Cancelar', style: 'cancel' },
              ])
            }
          >
            <Text style={s.qIdx}>{String(i + 1).padStart(2, '0')}</Text>
            {track.thumb
              ? <Image source={{ uri: track.thumb }} style={s.thumb} />
              : (
                <View style={[s.thumb, s.thumbPh]}>
                  <Music size={12} color="#1e1e1e" />
                </View>
              )
            }
            <View style={s.info}>
              <Text style={s.title} numberOfLines={1}>{track.title}</Text>
              <Text style={s.artist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() =>
          upNext.length > 0 ? (
            <>
              <Text style={s.lbl}>// DESPUÉS EN PLAYLIST</Text>
              {upNext.map((t, i) => (
                <TouchableOpacity
                  key={t.id + i}
                  style={s.row}
                  onPress={() => playTrack(t, currentIdx + 1 + i)}
                >
                  <Text style={s.qIdx}>{String(i + 1).padStart(2, '0')}</Text>
                  {t.thumb
                    ? <Image source={{ uri: t.thumb }} style={s.thumb} />
                    : (
                      <View style={[s.thumb, s.thumbPh]}>
                        <Music size={12} color="#1e1e1e" />
                      </View>
                    )
                  }
                  <View style={s.info}>
                    <Text style={s.title} numberOfLines={1}>{t.title}</Text>
                    <Text style={s.artist} numberOfLines={1}>{t.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : null
        }
      />

      {/* Footer controls */}
      <View style={s.footer}>
        {[
          {
            label: 'SHUFFLE',
            on: isShuffle,
            Icon: Shuffle,
            action: () => dispatch({ type: 'SET_SHUFFLE', v: !isShuffle }),
          },
          {
            label: repeatMode === 'one' ? 'REPEAT×1' : 'REPEAT',
            on: repeatMode !== 'off',
            Icon: Repeat,
            action: () => {
              const m = ['off', 'all', 'one']
              dispatch({ type: 'SET_REPEAT', v: m[(m.indexOf(repeatMode) + 1) % 3] })
            },
          },
          {
            label: sleepMins > 0 ? `${sleepMins}MIN` : 'TIMER',
            on: sleepMins > 0,
            Icon: Timer,
            action: handleTimer,
          },
        ].map(({ label, on, Icon, action }) => (
          <TouchableOpacity
            key={label}
            style={[s.footBtn, on && { borderColor: accent + '66' }]}
            onPress={action}
          >
            <Icon size={18} color={on ? accent : '#252525'} />
            <Text style={[s.footLbl, on && { color: accent }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 54,
    paddingBottom: 14,
  },
  backBtn: { padding: 4 },
  headerTxt: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  divider: { height: 1, backgroundColor: '#111' },

  lbl: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
    color: '#222',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#0e0e0e',
  },
  rowNow: {
    borderLeftWidth: 1,
    backgroundColor: '#0a0a0a',
  },
  qIdx: {
    color: '#1e1e1e',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 22,
    textAlign: 'right',
  },
  thumb: {
    width: 38,
    height: 38,
    flexShrink: 0,
  },
  thumbPh: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  info: { flex: 1, minWidth: 0 },
  title: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  artist: {
    color: '#252525',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  nowTag: {
    fontSize: 10,
    fontFamily: 'monospace',
  },

  footer: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingBottom: 30,
  },
  footBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#111',
  },
  footLbl: {
    color: '#252525',
    fontSize: 7,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
})