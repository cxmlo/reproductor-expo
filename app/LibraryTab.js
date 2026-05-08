import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, TextInput, Modal,
} from 'react-native'
import { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useStore } from '../store'
import { useAudio } from '../hooks/useAudio'
import { SwipeRow } from '../components/SwipeRow'
import { MiniPlayer } from '../components/MiniPlayer'
import { Music, Plus, ChevronLeft, Edit, Dots } from '../components/Icons'

const Stack = createNativeStackNavigator()

// ─── PLAYLIST LIST ─────────────────────────────────────────────────────────────
function LibraryList({ navigation }) {
  const { state, dispatch } = useStore()
  const { playlists, accent } = state
  const [modal, setModal]   = useState(false)
  const [newName, setNewName] = useState('')

  const createPlaylist = () => {
    if (!newName.trim()) return
    const pl = { id: `pl_${Date.now()}`, name: newName.trim(), photo: null, tracks: [] }
    dispatch({ type: 'SET_PLAYLISTS', v: [...playlists, pl] })
    setNewName('')
    setModal(false)
  }

  const deletePlaylist = (id) => {
    Alert.alert('ELIMINAR', '¿Seguro?', [
      {
        text: 'Eliminar', style: 'destructive',
        onPress: () => dispatch({ type: 'SET_PLAYLISTS', v: playlists.filter(p => p.id !== id) }),
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.headerTag, { color: accent + '66' }]}>// MÓDULO</Text>
          <Text style={[s.title, { color: accent }]}>BIBLIOTECA</Text>
        </View>
        <TouchableOpacity
          style={[s.createBtn, { borderColor: accent + '55' }]}
          onPress={() => setModal(true)}
        >
          <Text style={[s.createTxt, { color: accent }]}>+ NUEVA</Text>
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      <FlatList
        data={playlists}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 4 }}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Text style={[s.emptyGlyph, { color: accent + '22' }]}>
              {'┌──────┐\n│  ♪   │\n└──────┘'}
            </Text>
            <Text style={s.emptyTitle}>0 PLAYLISTS</Text>
            <TouchableOpacity
              style={[s.emptyBtn, { borderColor: accent }]}
              onPress={() => setModal(true)}
            >
              <Text style={[s.emptyBtnTxt, { color: accent }]}>
                [+ CREAR]
              </Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item: pl, index: i }) => (
          <TouchableOpacity
            style={s.plRow}
            onPress={() => navigation.navigate('Playlist', { pl })}
            onLongPress={() =>
              Alert.alert(pl.name, '', [
                { text: 'Ver playlist', onPress: () => navigation.navigate('Playlist', { pl }) },
                { text: 'Editar',       onPress: () => navigation.navigate('EditPlaylist', { pl }) },
                { text: 'Eliminar',     style: 'destructive', onPress: () => deletePlaylist(pl.id) },
                { text: 'Cancelar',     style: 'cancel' },
              ])
            }
            activeOpacity={0.7}
          >
            <Text style={s.plIdx}>{String(i + 1).padStart(2, '0')}</Text>
            {pl.photo
              ? <Image source={{ uri: pl.photo }} style={s.plArt} />
              : (
                <View style={[s.plArt, s.plArtPh]}>
                  <Music size={18} color="#1e1e1e" />
                </View>
              )
            }
            <View style={s.plInfo}>
              <Text style={s.plName} numberOfLines={1}>{pl.name}</Text>
              <Text style={s.plMeta}>{pl.tracks?.length || 0} TRACKS</Text>
            </View>
            <TouchableOpacity
              style={s.dotBtn}
              onPress={() =>
                Alert.alert(pl.name, '', [
                  { text: 'Editar',   onPress: () => navigation.navigate('EditPlaylist', { pl }) },
                  { text: 'Eliminar', style: 'destructive', onPress: () => deletePlaylist(pl.id) },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
            >
              <Text style={s.dotsTxt}>⋮</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.sep} />}
      />

      {/* Create modal */}
      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setModal(false)}
        >
          <View style={s.modalCard} onStartShouldSetResponder={() => true}>
            {/* Box drawing */}
            <Text style={[s.modalBorder, { color: accent + '44' }]}>
              {'┌─────────────────────┐'}
            </Text>
            <Text style={[s.modalTitle, { color: accent }]}>NUEVA PLAYLIST</Text>
            <TextInput
              style={[s.modalInput, { borderColor: accent + '44', color: accent }]}
              placeholder="nombre..."
              placeholderTextColor="#252525"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={createPlaylist}
              selectionColor={accent}
              fontFamily="monospace"
            />
            <View style={s.modalBtns}>
              <TouchableOpacity
                style={s.modalCancel}
                onPress={() => setModal(false)}
              >
                <Text style={s.modalCancelTxt}>[CANCELAR]</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalCreate, { borderColor: accent }]}
                onPress={createPlaylist}
              >
                <Text style={[s.modalCreateTxt, { color: accent }]}>[CREAR]</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.modalBorder, { color: accent + '44' }]}>
              {'└─────────────────────┘'}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <MiniPlayer />
    </View>
  )
}

// ─── PLAYLIST DETAIL ──────────────────────────────────────────────────────────
function PlaylistDetail({ route, navigation }) {
  const { pl: initialPl } = route.params
  const { state, dispatch } = useStore()
  const { playTrack } = useAudio()
  const { accent } = state
  const pl = state.playlists.find(p => p.id === initialPl.id) || initialPl
  const tracks = pl.tracks || []

  const play = (track, idx) => {
    dispatch({ type: 'SET_CURRENT_PL', v: pl })
    playTrack(track, idx, pl)
  }
  const addQueue = (track) => {
    dispatch({ type: 'ADD_QUEUE', v: track })
    Alert.alert('COLA', `"${track.title}" agregada`)
  }
  const deleteTrack = (track) => {
    const updated = state.playlists.map(p =>
      p.id === pl.id
        ? { ...p, tracks: p.tracks.filter(t => t.id !== track.id) }
        : p
    )
    dispatch({ type: 'SET_PLAYLISTS', v: updated })
  }

  return (
    <View style={s.root}>
      <View style={s.plHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={20} color="#555" />
        </TouchableOpacity>
        {pl.photo
          ? <Image source={{ uri: pl.photo }} style={s.plHeaderArt} />
          : (
            <View style={[s.plHeaderArt, s.plArtPh]}>
              <Music size={20} color="#1e1e1e" />
            </View>
          )
        }
        <View style={s.plHeaderInfo}>
          <Text style={[s.plHeaderName, { color: accent }]} numberOfLines={1}>
            {pl.name}
          </Text>
          <Text style={s.plHeaderMeta}>{tracks.length} TRACKS</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditPlaylist', { pl })}
          style={s.editBtn}
        >
          <Edit size={16} color="#444" />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      {tracks.length === 0
        ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>PLAYLIST VACÍA</Text>
            <Text style={s.emptyHint}>{'> busca canciones y agrégalas aquí'}</Text>
          </View>
        )
        : (
          <FlatList
            data={tracks}
            keyExtractor={t => t.id}
            contentContainerStyle={{ paddingBottom: 160 }}
            renderItem={({ item: track, index: i }) => (
              <SwipeRow
                track={track}
                index={i}
                isActive={state.currentTrack?.id === track.id}
                isPlaying={state.isPlaying}
                accent={accent}
                onPress={() => play(track, i)}
                onAddQueue={() => addQueue(track)}
                onDelete={() => deleteTrack(track)}
                onLongPress={() =>
                  Alert.alert(track.title, track.artist, [
                    { text: 'Reproducir',        onPress: () => play(track, i) },
                    { text: 'Agregar a la cola', onPress: () => addQueue(track) },
                    { text: 'Eliminar',          style: 'destructive', onPress: () => deleteTrack(track) },
                    { text: 'Cancelar',          style: 'cancel' },
                  ])
                }
              />
            )}
          />
        )
      }
      <MiniPlayer />
    </View>
  )
}

// ─── EDIT PLAYLIST ────────────────────────────────────────────────────────────
function EditPlaylist({ route, navigation }) {
  const { pl } = route.params
  const { state, dispatch } = useStore()
  const { accent } = state
  const [name, setName] = useState(pl.name)

  const save = () => {
    const updated = state.playlists.map(p =>
      p.id === pl.id ? { ...p, name: name.trim() || p.name } : p
    )
    dispatch({ type: 'SET_PLAYLISTS', v: updated })
    navigation.goBack()
  }

  const del = () => {
    Alert.alert('ELIMINAR', `¿Eliminar "${pl.name}"?`, [
      {
        text: 'Eliminar', style: 'destructive',
        onPress: () => {
          dispatch({ type: 'SET_PLAYLISTS', v: state.playlists.filter(p => p.id !== pl.id) })
          navigation.popToTop()
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  return (
    <View style={s.root}>
      <View style={s.plHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color="#555" />
        </TouchableOpacity>
        <Text style={[s.plHeaderName, { color: accent, flex: 1 }]}>
          EDITAR PLAYLIST
        </Text>
      </View>

      <View style={s.divider} />

      <View style={s.editBody}>
        <Text style={s.fieldLbl}>// NOMBRE</Text>
        <TextInput
          style={[s.editInput, { borderColor: accent + '44', color: accent }]}
          value={name}
          onChangeText={setName}
          placeholder="nombre..."
          placeholderTextColor="#252525"
          selectionColor={accent}
        />
        <TouchableOpacity
          style={[s.saveBtn, { borderColor: accent }]}
          onPress={save}
        >
          <Text style={[s.saveTxt, { color: accent }]}>[ GUARDAR ]</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.delBtn} onPress={del}>
          <Text style={s.delTxt}>[ ELIMINAR PLAYLIST ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function LibraryTab() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050505' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LibraryList"  component={LibraryList} />
      <Stack.Screen name="Playlist"     component={PlaylistDetail} />
      <Stack.Screen name="EditPlaylist" component={EditPlaylist} />
    </Stack.Navigator>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 14,
  },
  headerTag: {
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  createBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  createTxt: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  divider: { height: 1, backgroundColor: '#111', marginBottom: 2 },

  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  plIdx: {
    color: '#1e1e1e',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 22,
    textAlign: 'right',
  },
  plArt: { width: 48, height: 48, flexShrink: 0 },
  plArtPh: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  plInfo: { flex: 1, minWidth: 0 },
  plName: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  plMeta: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  dotBtn: { padding: 8 },
  dotsTxt: { color: '#333', fontSize: 18 },
  sep: { height: 1, backgroundColor: '#0e0e0e', marginLeft: 14 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 80,
  },
  emptyGlyph: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTitle: {
    color: '#222',
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  emptyHint: {
    color: '#1a1a1a',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  emptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyBtnTxt: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#070707',
    padding: 24,
    width: '82%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  modalBorder: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 3,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    padding: 10,
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#0a0a0a',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: { paddingVertical: 8, paddingHorizontal: 4 },
  modalCancelTxt: {
    color: '#2a2a2a',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  modalCreate: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  modalCreateTxt: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  plHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 56,
    paddingBottom: 14,
  },
  backBtn: { padding: 4 },
  plHeaderArt: { width: 40, height: 40 },
  plHeaderInfo: { flex: 1, minWidth: 0 },
  plHeaderName: {
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 2,
  },
  plHeaderMeta: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  editBtn: { padding: 6 },

  editBody: { padding: 20, gap: 14 },
  fieldLbl: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  editInput: {
    borderWidth: 1,
    padding: 11,
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#0a0a0a',
  },
  saveBtn: {
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveTxt: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  delBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a0a0a',
    alignItems: 'center',
    marginTop: 4,
  },
  delTxt: {
    color: '#5a1a1a',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
})