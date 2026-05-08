import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from 'react-native'
import { useStore } from '../store'
import { useAudio, fmt } from '../hooks/useAudio'
import { useNavigation } from '@react-navigation/native'
import { Play, Pause, SkipNext, SkipPrev, Music } from './Icons'

export function MiniPlayer() {
  const { state } = useStore()
  const { togglePlay, nextTrack, prevTrack } = useAudio()
  const nav = useNavigation()
  const { currentTrack, isPlaying, progress, duration, accent } = state
  if (!currentTrack) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <Pressable style={s.wrap} onPress={() => nav.navigate('Player')}>
      {/* scanline effect */}
      <View style={s.scanlines} pointerEvents="none" />

      <View style={s.card}>
        {/* Corner brackets */}
        <View style={[s.corner, s.cornerTL, { borderColor: accent }]} />
        <View style={[s.corner, s.cornerTR, { borderColor: accent }]} />
        <View style={[s.corner, s.cornerBL, { borderColor: accent }]} />
        <View style={[s.corner, s.cornerBR, { borderColor: accent }]} />

        {/* Progress bar at top */}
        <View style={s.progTrack}>
          <View style={[s.progFill, { width: `${pct}%`, backgroundColor: accent }]} />
        </View>

        <View style={s.row}>
          {currentTrack.thumb
            ? <Image source={{ uri: currentTrack.thumb }} style={s.thumb} />
            : (
              <View style={[s.thumb, s.thumbPh]}>
                <Music size={16} color="#2a2a2a" />
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
            <Text style={s.time}>
              {fmt(progress)} / {fmt(duration)}
            </Text>
          </View>

          <View style={s.ctrls}>
            <TouchableOpacity
              style={s.cb}
              onPress={e => { e.stopPropagation?.(); prevTrack() }}
            >
              <SkipPrev size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.playBtn, { borderColor: accent }]}
              onPress={e => { e.stopPropagation?.(); togglePlay() }}
            >
              {isPlaying
                ? <Pause size={14} color={accent} />
                : <Play  size={14} color={accent} />
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={s.cb}
              onPress={e => { e.stopPropagation?.(); nextTrack() }}
            >
              <SkipNext size={15} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom status bar */}
        <View style={s.statusBar}>
          <Text style={[s.statusTxt, { color: accent + '66' }]}>
            {isPlaying ? '▶ REPRODUCIENDO' : '⏸ PAUSADO'}
          </Text>
          <Text style={[s.statusTxt, { color: '#1e1e1e' }]}>
            {'////'}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 82,
    left: 8,
    right: 8,
    zIndex: 100,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 8, height: 8,
    zIndex: 2,
    opacity: 0.8,
  },
  cornerTL: { top: -1, left: -1,  borderTopWidth: 1, borderLeftWidth: 1 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 },
  cornerBL: { bottom: -1, left: -1,  borderBottomWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 },
  progTrack: {
    height: 2,
    backgroundColor: '#111',
  },
  progFill: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  thumbPh: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  artist: {
    color: '#444',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  time: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  ctrls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cb: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  statusTxt: {
    fontSize: 7,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
})