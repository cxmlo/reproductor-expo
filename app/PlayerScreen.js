import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, PanResponder, Animated,
} from 'react-native'
import { useRef, useMemo } from 'react'
import { useStore } from '../store'
import { useAudio, fmt } from '../hooks/useAudio'
import {
  Play, Pause, SkipNext, SkipPrev,
  Shuffle, Repeat, Queue, ChevronDown, Music,
} from '../components/Icons'

const { width: W, height: H } = Dimensions.get('window')
const SWIPE_DOWN_THRESHOLD  = 80
const SWIPE_HORIZ_THRESHOLD = 80

export default function PlayerScreen({ navigation }) {
  const { state, dispatch } = useStore()
  const { togglePlay, seekTo, nextTrack, prevTrack } = useAudio()
  const {
    currentTrack, currentPl, isPlaying,
    progress, duration, isShuffle, repeatMode, loading, accent,
  } = state

  const translateY = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(0)).current
  const progRef    = useRef(null)

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      if (Math.abs(g.dy) > Math.abs(g.dx)) {
        if (g.dy > 0) translateY.setValue(g.dy)
      } else {
        translateX.setValue(g.dx)
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > SWIPE_DOWN_THRESHOLD && Math.abs(g.dy) > Math.abs(g.dx)) {
        Animated.timing(translateY, {
          toValue: H, duration: 250, useNativeDriver: true,
        }).start(() => { translateY.setValue(0); navigation.goBack() })
      } else if (g.dx < -SWIPE_HORIZ_THRESHOLD) {
        Animated.timing(translateX, {
          toValue: -W, duration: 200, useNativeDriver: true,
        }).start(() => { translateX.setValue(0); nextTrack() })
      } else if (g.dx > SWIPE_HORIZ_THRESHOLD) {
        Animated.timing(translateX, {
          toValue: W, duration: 200, useNativeDriver: true,
        }).start(() => { translateX.setValue(0); prevTrack() })
      } else {
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        ]).start()
      }
    },
  }), [nextTrack, prevTrack, navigation])

  const seekPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX
      progRef.current?.measure((_, __, w) => {
        if (w > 0) seekTo((x / w) * duration)
      })
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.locationX
      progRef.current?.measure((_, __, w) => {
        if (w > 0) seekTo(Math.max(0, Math.min(1, x / w)) * duration)
      })
    },
  }), [duration, seekTo])

  const pct = duration > 0 ? progress / duration : 0

  if (!currentTrack) return (
    <View style={s.empty}>
      <Text style={[s.emptyGlyph, { color: accent + '22' }]}>
        {'╔══════╗\n║  ♪   ║\n╚══════╝'}
      </Text>
      <Text style={s.emptyTxt}>SIN REPRODUCCIÓN ACTIVA</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
        <ChevronDown size={22} color="#444" />
      </TouchableOpacity>
    </View>
  )

  return (
    <Animated.View
      style={[s.root, { transform: [{ translateY }, { translateX }] }]}
      {...panResponder.panHandlers}
    >
      {/* Artwork full bleed */}
      <View style={s.artWrap} pointerEvents="none">
        {currentTrack.thumb
          ? <Image source={{ uri: currentTrack.thumb }} style={s.art} resizeMode="cover" />
          : (
            <View style={[s.art, s.artPh]}>
              <Text style={[s.artPlaceholder, { color: accent + '11' }]}>
                {'▓▓▓▓▓▓▒▒▒░░░\n▓▓▒░  ♪  ░▒▓▓\n░░░▒▒▒▓▓▓▓▓▓▓'}
              </Text>
            </View>
          )
        }
        {/* Dark overlay */}
        <View style={s.overlay} />
        {/* CRT scanlines */}
        <View style={s.scanlines} pointerEvents="none" />
      </View>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.hBtn}>
          <ChevronDown size={20} color={accent + '88'} />
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={[s.hLabel, { color: accent + '55' }]}>▶ REPRODUCIENDO</Text>
          {currentPl && (
            <Text style={[s.hPl, { color: accent + '33' }]} numberOfLines={1}>
              {currentPl.name}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Queue')}
          style={s.hBtn}
        >
          <Queue size={16} color={accent + '88'} />
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={s.loadWrap} pointerEvents="none">
          <Text style={[s.loadTxt, { color: accent }]}>
            CARGANDO...
          </Text>
        </View>
      )}

      {/* Track info */}
      <View style={s.info} pointerEvents="none">
        <Text style={[s.trackTitle, { color: accent }]} numberOfLines={2}>
          {currentTrack.title}
        </Text>
        <Text style={s.trackArtist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Controls */}
      <View style={s.ctrls}>
        {/* Progress */}
        <View ref={progRef} style={s.progTouchArea} {...seekPan.panHandlers}>
          <View style={s.progRail}>
            <View
              style={[s.progFill, { width: `${pct * 100}%`, backgroundColor: accent }]}
            />
          </View>
          <View
            style={[s.progThumb, {
              left: `${pct * 100}%`,
              borderColor: accent,
              backgroundColor: '#050505',
            }]}
          />
        </View>
        <View style={s.times}>
          <Text style={[s.time, { color: accent + '66' }]}>{fmt(progress)}</Text>
          <Text style={[s.time, { color: accent + '33' }]}>{fmt(duration)}</Text>
        </View>

        {/* Buttons */}
        <View style={s.mainRow}>
          <TouchableOpacity
            style={s.sideBtn}
            onPress={() => dispatch({ type: 'SET_SHUFFLE', v: !isShuffle })}
          >
            <Shuffle size={18} color={isShuffle ? accent : '#252525'} />
            {isShuffle && (
              <View style={[s.toggleDot, { backgroundColor: accent }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={prevTrack}>
            <SkipPrev size={24} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.playBtn, { borderColor: accent }]}
            onPress={togglePlay}
          >
            {isPlaying
              ? <Pause size={26} color={accent} />
              : <Play  size={26} color={accent} />
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={nextTrack}>
            <SkipNext size={24} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.sideBtn}
            onPress={() => {
              const m = ['off', 'all', 'one']
              dispatch({ type: 'SET_REPEAT', v: m[(m.indexOf(repeatMode) + 1) % 3] })
            }}
          >
            <Repeat size={18} color={repeatMode !== 'off' ? accent : '#252525'} />
            {repeatMode !== 'off' && (
              <View style={[s.toggleDot, { backgroundColor: accent }]} />
            )}
            {repeatMode === 'one' && (
              <Text style={[s.oneLabel, { color: accent }]}>1</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <Text style={[s.hint, { color: accent + '22' }]}>
          ← desliza canción  ·  ↓ cerrar →
        </Text>
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  empty: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyGlyph: {
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 26,
  },
  emptyTxt: {
    color: '#2a2a2a',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  closeBtn: { padding: 14 },

  artWrap: { ...StyleSheet.absoluteFillObject },
  art: { width: '100%', height: '100%' },
  artPh: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artPlaceholder: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 26,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.88)',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
  },

  header: {
    position: 'absolute',
    top: 52,
    left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  hBtn: { padding: 8 },
  hCenter: { flex: 1, alignItems: 'center' },
  hLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  hPl: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 2,
  },

  loadWrap: {
    position: 'absolute',
    top: '48%',
    left: 0, right: 0,
    alignItems: 'center',
  },
  loadTxt: {
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },

  info: {
    position: 'absolute',
    bottom: 230,
    left: 22,
    right: 22,
  },
  trackTitle: {
    fontSize: 22,
    fontFamily: 'monospace',
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  trackArtist: {
    color: '#333',
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  ctrls: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    paddingHorizontal: 22,
    paddingBottom: 52,
  },

  progTouchArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2,
  },
  progRail: {
    height: 1,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  progFill: { height: '100%' },
  progThumb: {
    position: 'absolute',
    width: 10, height: 10,
    borderWidth: 1,
    top: 11,
    marginLeft: -5,
  },

  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  time: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: { padding: 10 },
  sideBtn: {
    padding: 10,
    position: 'relative',
    alignItems: 'center',
  },
  toggleDot: {
    position: 'absolute',
    bottom: 5,
    width: 3, height: 3,
  },
  oneLabel: {
    position: 'absolute',
    top: 4, right: 4,
    fontSize: 7,
    fontFamily: 'monospace',
  },

  hint: {
    fontSize: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 1,
  },
})