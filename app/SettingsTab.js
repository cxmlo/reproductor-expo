import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Alert, Image,
} from 'react-native'
import { useState } from 'react'
import { useStore, ACCENT_COLORS } from '../store'

export default function SettingsTab() {
  const { state, dispatch } = useStore()
  const { profile, accent } = state
  const [name, setName] = useState(profile.name || '')

  const saveName = () => {
    dispatch({ type: 'SET_PROFILE', v: { name: name.trim() } })
    Alert.alert('OK', 'Guardado')
  }

  const clearData = () =>
    Alert.alert('BORRAR TODO', '¿Borrar todas las playlists y datos?', [
      {
        text: 'Borrar', style: 'destructive',
        onPress: () => {
          dispatch({ type: 'SET_PLAYLISTS', v: [] })
          dispatch({ type: 'SET_PROFILE', v: { name: '', email: '', photo: null } })
          Alert.alert('OK', 'Datos borrados')
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])

  const totalTracks = state.playlists.reduce((a, p) => a + (p.tracks?.length || 0), 0)

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={[s.headerTag, { color: accent + '66' }]}>// MÓDULO</Text>
        <Text style={[s.title, { color: accent }]}>CONFIG</Text>
      </View>
      <View style={s.divider} />

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar block */}
        <View style={s.avatarBlock}>
          <View style={[s.avatar, { borderColor: accent }]}>
            {profile.photo
              ? <Image source={{ uri: profile.photo }} style={s.avatarImg} />
              : (
                <Text style={[s.avatarTxt, { color: accent }]}>
                  {(name || '?')[0].toUpperCase()}
                </Text>
              )
            }
          </View>
          <View style={s.avatarInfo}>
            <Text style={[s.avatarName, { color: accent }]}>
              {name || 'ANÓNIMO'}
            </Text>
            <Text style={s.avatarSub}>
              {`${state.playlists.length} PL · ${totalTracks} TRK`}
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={s.sec}>
          <Text style={s.secTitle}>// NOMBRE DE USUARIO</Text>
          <TextInput
            style={[s.inp, { borderColor: accent + '33', color: accent }]}
            value={name}
            onChangeText={setName}
            placeholder="tu nombre..."
            placeholderTextColor="#252525"
            autoCapitalize="words"
            selectionColor={accent}
          />
          <TouchableOpacity
            style={[s.btn, { borderColor: accent + '55' }]}
            onPress={saveName}
          >
            <Text style={[s.btnTxt, { color: accent }]}>[ GUARDAR ]</Text>
          </TouchableOpacity>
        </View>

        {/* Accent selector */}
        <View style={s.sec}>
          <Text style={s.secTitle}>// COLOR DE ACENTO</Text>
          <View style={s.colorGrid}>
            {ACCENT_COLORS.map(c => {
              const active = accent === c.value
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    s.colorBtn,
                    active && { borderColor: c.value },
                  ]}
                  onPress={() => dispatch({ type: 'SET_ACCENT', v: c.value })}
                >
                  <View style={[s.colorSwatch, { backgroundColor: c.value }]} />
                  <Text style={[s.colorName, active && { color: c.value }]}>
                    {c.name.toUpperCase()}
                  </Text>
                  {active && (
                    <Text style={[s.colorCheck, { color: c.value }]}>●</Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={s.sec}>
          <Text style={s.secTitle}>// ESTADÍSTICAS</Text>
          <View style={[s.statCard, { borderColor: accent + '22' }]}>
            <View style={s.statRow}>
              <Text style={s.statLbl}>PLAYLISTS</Text>
              <Text style={[s.statVal, { color: accent }]}>
                {String(state.playlists.length).padStart(4, '0')}
              </Text>
            </View>
            <View style={[s.statSep, { backgroundColor: accent + '11' }]} />
            <View style={s.statRow}>
              <Text style={s.statLbl}>CANCIONES</Text>
              <Text style={[s.statVal, { color: accent }]}>
                {String(totalTracks).padStart(4, '0')}
              </Text>
            </View>
            <View style={[s.statSep, { backgroundColor: accent + '11' }]} />
            <View style={s.statRow}>
              <Text style={s.statLbl}>STATUS</Text>
              <Text style={[s.statVal, { color: accent }]}>OK</Text>
            </View>
          </View>
        </View>

        {/* System info */}
        <View style={s.sec}>
          <Text style={s.secTitle}>// SISTEMA</Text>
          <View style={[s.infoCard, { borderColor: '#111' }]}>
            <Text style={s.infoLine}>APP     cxmluwu mobile v2.0</Text>
            <Text style={s.infoLine}>ENGINE  expo-audio</Text>
            <Text style={s.infoLine}>SEARCH  youtube data api v3</Text>
            <Text style={s.infoLine}>STREAM  invidious (fallback)</Text>
            <Text style={[s.infoLine, { color: accent + '55', marginTop: 8 }]}>
              ACCENT  {accent}
            </Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={s.sec}>
          <Text style={[s.secTitle, { color: '#3a1a1a' }]}>// ZONA PELIGROSA</Text>
          <TouchableOpacity style={s.delBtn} onPress={clearData}>
            <Text style={s.delTxt}>[ BORRAR TODOS LOS DATOS ]</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  header: {
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
    letterSpacing: 6,
  },
  divider: { height: 1, backgroundColor: '#111', marginBottom: 2 },

  body: { padding: 16, gap: 0 },

  avatarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0e0e0e',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarTxt: { fontSize: 24, fontFamily: 'monospace' },
  avatarInfo: { flex: 1 },
  avatarName: {
    fontSize: 16,
    fontFamily: 'monospace',
    letterSpacing: 3,
    marginBottom: 4,
  },
  avatarSub: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  sec: { marginBottom: 24 },
  secTitle: {
    color: '#2a2a2a',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 3,
    marginBottom: 10,
  },

  inp: {
    borderWidth: 1,
    padding: 10,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 10,
    backgroundColor: '#080808',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  btnTxt: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  colorGrid: { gap: 6 },
  colorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#080808',
  },
  colorSwatch: { width: 10, height: 10 },
  colorName: {
    flex: 1,
    color: '#2a2a2a',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  colorCheck: {
    fontSize: 8,
    fontFamily: 'monospace',
  },

  statCard: {
    borderWidth: 1,
    backgroundColor: '#080808',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLbl: {
    color: '#2a2a2a',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  statVal: {
    fontSize: 18,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  statSep: { height: 1 },

  infoCard: {
    borderWidth: 1,
    padding: 14,
    backgroundColor: '#080808',
    gap: 5,
  },
  infoLine: {
    color: '#252525',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  delBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a0a0a',
    alignItems: 'center',
  },
  delTxt: {
    color: '#5a1a1a',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
})