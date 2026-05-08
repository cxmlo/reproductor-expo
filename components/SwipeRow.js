import { useRef, useState } from 'react'
import { Animated, View, Text, TouchableOpacity, Image, StyleSheet, PanResponder } from 'react-native'
import { Music, Plus, Trash } from './Icons'
import { fmt } from '../hooks/useAudio'

const SWIPE_THRESHOLD = 60

export function SwipeRow({ track, index, isActive, isPlaying, accent, onPress, onAddQueue, onDelete, onLongPress }) {
  const translateX = useRef(new Animated.Value(0)).current

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => {
      translateX.setValue(Math.max(-80, Math.min(80, g.dx)))
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start()
        onAddQueue?.()
      } else if (g.dx < -SWIPE_THRESHOLD) {
        Animated.timing(translateX, {
          toValue: -400, duration: 200, useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0)
          onDelete?.()
        })
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start()
      }
    },
  })).current

  return (
    <View style={s.container}>
      {/* Background hint layer */}
      <View style={s.bg}>
        <View style={s.bgLeft}>
          <Text style={s.bgIcon}>+</Text>
          <Text style={s.bgTxt}>COLA</Text>
        </View>
        <View style={s.bgRight}>
          <Text style={s.bgIcon}>×</Text>
          <Text style={s.bgTxt}>DEL</Text>
        </View>
      </View>

      <Animated.View
        style={[s.row, isActive && s.rowActive, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={s.inner}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
          {/* Index / playing indicator */}
          <View style={s.numWrap}>
            {isActive ? (
              <View style={[s.activeIndicator, { backgroundColor: accent }]} />
            ) : (
              <Text style={s.num}>{String(index + 1).padStart(2, '0')}</Text>
            )}
          </View>

          {/* Thumbnail */}
          {track.thumb
            ? <Image source={{ uri: track.thumb }} style={s.thumb} />
            : (
              <View style={[s.thumb, s.thumbPh]}>
                <Music size={12} color="#2a2a2a" />
              </View>
            )
          }

          {/* Info */}
          <View style={s.info}>
            <Text
              style={[s.title, isActive && { color: accent }]}
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text style={s.artist} numberOfLines={1}>{track.artist}</Text>
          </View>

          {/* Duration */}
          <View style={s.right}>
            {isActive && isPlaying && (
              <Text style={[s.playingTag, { color: accent }]}>▶</Text>
            )}
            <Text style={s.dur}>{fmt(track.duration)}</Text>
          </View>
        </TouchableOpacity>

        {/* Left border when active */}
        {isActive && (
          <View style={[s.leftBorder, { backgroundColor: accent }]} />
        )}
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#0e0e0e',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0a0a0a',
  },
  bgLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 20,
    flex: 1,
  },
  bgRight: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingRight: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#1a1a1a',
  },
  bgIcon: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  bgTxt: {
    color: '#2a2a2a',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  row: {
    backgroundColor: '#080808',
    position: 'relative',
  },
  rowActive: {
    backgroundColor: '#0d0d0d',
  },
  leftBorder: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 10,
  },
  numWrap: {
    width: 24,
    alignItems: 'flex-end',
  },
  num: {
    color: '#252525',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  activeIndicator: {
    width: 4,
    height: 4,
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
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  artist: {
    color: '#2e2e2e',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playingTag: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
  dur: {
    color: '#252525',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 34,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
})