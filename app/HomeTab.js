import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import { useStore } from '../store'
import { MiniPlayer } from '../components/MiniPlayer'
import { Music } from '../components/Icons'
import { useAudio } from '../hooks/useAudio'

// Decorative scanlines component
function Scanlines() {
  return (
    <View style={sl.wrap} pointerEvents="none">
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} style={sl.line} />
      ))}
    </View>
  )
}

const sl = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 0, overflow: 'hidden', opacity: 0.015 },
  line: { height: 2, backgroundColor: '#fff', marginBottom: 6 },
})

export default function HomeTab({ navigation }) {
  const { state, dispatch } = useStore()
  const { playTrack } = useAudio()
  const { playlists, currentTrack, accent, profile } = state

  const recentTracks = playlists.flatMap(pl => pl.tracks || []).slice(0, 12)

  const playRandom = () => {
    const all = playlists.flatMap(pl =>
      (pl.tracks || []).map(t => ({ ...t, _pl: pl }))
    )
    if (!all.length) return
    const pick = all[Math.floor(Math.random() * all.length)]
    dispatch({ type: 'SET_CURRENT_PL', v: pick._pl })
    playTrack(pick, pick._pl.tracks.findIndex(t => t.id === pick.id), pick._pl)
  }

  return (
    <View style={s.root}>
      <Scanlines />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={[s.logo, { color: accent }]}>CXMLUWU</Text>
            <Text style={s.greeting}>
              {profile.name ? `// ${profile.name.toUpperCase()}` : '// USUARIO'}
            </Text>
          </View>
          {/* Fix: navigate using tab navigation, not stack */}
          <TouchableOpacity
            style={[s.avatarBtn, { borderColor: accent + '44' }]}
            onPress={() => navigation.navigate('SettingsTab')}
          >
            {profile.photo
              ? <Image source={{ uri: profile.photo }} style={s.avatarImg} />
              : (
                <Text style={[s.avatarTxt, { color: accent }]}>
                  {(profile.name || '?')[0].toUpperCase()}
                </Text>
              )
            }
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: accent + '22' }]} />

        {/* Status line */}
        <View style={s.statusLine}>
          <Text style={s.statusChunk}>SYS:OK</Text>
          <Text style={s.statusChunk}>
            PL:{playlists.length}
          </Text>
          <Text style={s.statusChunk}>
            TRK:{playlists.reduce((a, p) => a + (p.tracks?.length || 0), 0)}
          </Text>
          {currentTrack && (
            <Text style={[s.statusChunk, { color: accent }]}>▶ LIVE</Text>
          )}
        </View>

        {/* Quick action */}
        {playlists.length > 0 && (
          <TouchableOpacity
            style={[s.shuffleBtn, { borderColor: accent + '55' }]}
            onPress={playRandom}
            activeOpacity={0.7}
          >
            <Text style={[s.shuffleTag, { color: accent + '88' }]}>[CMD]</Text>
            <Text style={[s.shuffleTxt, { color: accent }]}>
              RANDOM_PLAY --all
            </Text>
          </TouchableOpacity>
        )}

        {/* Playlists */}
        {playlists.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>// PLAYLISTS</Text>
            <FlatList
              data={playlists}
              keyExtractor={i => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
              renderItem={({ item: pl }) => (
                <TouchableOpacity
                  style={[s.plCard, { borderColor: accent + '22' }]}
                  onPress={() =>
                    navigation.navigate('LibraryTab', {
                      screen: 'Playlist',
                      params: { pl },
                    })
                  }
                  activeOpacity={0.8}
                >
                  {pl.photo
                    ? <Image source={{ uri: pl.photo }} style={s.plArt} />
                    : (
                      <View style={[s.plArt, s.plArtPh]}>
                        <Music size={24} color="#1e1e1e" />
                      </View>
                    )
                  }
                  <View style={s.plCardInfo}>
                    <Text style={s.plName} numberOfLines={1}>{pl.name}</Text>
                    <Text style={s.plCount}>{pl.tracks?.length || 0} TRK</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Recent tracks */}
        {recentTracks.length > 0 && (
          <View style={[s.section, { marginTop: 8 }]}>
            <Text style={s.sectionTitle}>// RECIENTES</Text>
            {recentTracks.map((t, i) => {
              const isActive = currentTrack?.id === t.id
              return (
                <TouchableOpacity
                  key={t.id + i}
                  style={[
                    s.trackRow,
                    isActive && { borderLeftColor: accent },
                  ]}
                  onPress={() => {
                    const pl = playlists.find(p => p.tracks?.some(x => x.id === t.id))
                    if (pl) {
                      dispatch({ type: 'SET_CURRENT_PL', v: pl })
                      playTrack(t, pl.tracks.findIndex(x => x.id === t.id), pl)
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.trackIdx, isActive && { color: accent }]}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  {t.thumb
                    ? <Image source={{ uri: t.thumb }} style={s.trackThumb} />
                    : (
                      <View style={[s.trackThumb, s.trackThumbPh]}>
                        <Music size={12} color="#1e1e1e" />
                      </View>
                    )
                  }
                  <View style={s.trackInfo}>
                    <Text
                      style={[s.trackTitle, isActive && { color: accent }]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
                  </View>
                  {isActive && (
                    <Text style={[s.nowTag, { color: accent }]}>▶</Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Empty state */}
        {playlists.length === 0 && (
          <View style={s.empty}>
            <Text style={[s.emptyGlyph, { color: accent + '33' }]}>
              {'░░░░░░\n░ ♪  ░\n░░░░░░'}
            </Text>
            <Text style={s.emptyTitle}>SIN DATOS</Text>
            <Text style={s.emptyHint}>
              {'> busca canciones y agrégalas\n> o crea una playlist en biblioteca'}
            </Text>
            <TouchableOpacity
              style={[s.emptyBtn, { borderColor: accent }]}
              onPress={() => navigation.navigate('SearchTab')}
            >
              <Text style={[s.emptyBtnTxt, { color: accent }]}>
                [BUSCAR →]
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 180 }} />
      </ScrollView>
      <MiniPlayer />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  scroll: { paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 14,
  },
  headerLeft: { gap: 4 },
  logo: {
    fontSize: 20,
    fontFamily: 'monospace',
    letterSpacing: 6,
  },
  greeting: {
    color: '#2a2a2a',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarTxt: { fontSize: 13, fontFamily: 'monospace' },

  divider: { height: 1, marginHorizontal: 16 },

  statusLine: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusChunk: {
    color: '#252525',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },

  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  shuffleTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  shuffleTxt: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  section: { marginTop: 16 },
  sectionTitle: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 3,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  plCard: {
    width: 130,
    borderWidth: 1,
    overflow: 'hidden',
  },
  plArt: { width: 130, height: 130 },
  plArtPh: {
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plCardInfo: {
    padding: 8,
    backgroundColor: '#080808',
  },
  plName: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  plCount: {
    color: '#252525',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderLeftWidth: 1,
    borderLeftColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#0d0d0d',
  },
  trackIdx: {
    color: '#222',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 20,
    textAlign: 'right',
  },
  trackThumb: { width: 36, height: 36, flexShrink: 0 },
  trackThumbPh: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  trackArtist: {
    color: '#2a2a2a',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  nowTag: { fontSize: 9, fontFamily: 'monospace' },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyGlyph: {
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 26,
  },
  emptyTitle: {
    color: '#2a2a2a',
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 6,
  },
  emptyHint: {
    color: '#1e1e1e',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  emptyBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  emptyBtnTxt: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
})