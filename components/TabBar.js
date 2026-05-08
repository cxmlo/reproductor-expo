import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useStore } from '../store'
import { Home, Search, Library, Settings } from './Icons'

export function TabBar({ state, descriptors, navigation }) {
  const { state: store } = useStore()
  const accent = store.accent

  const tabs = [
    { name: 'HomeTab',     label: 'INICIO',   Icon: Home },
    { name: 'SearchTab',   label: 'BUSCAR',   Icon: Search },
    { name: 'LibraryTab',  label: 'BIBLIOT',  Icon: Library },
    { name: 'SettingsTab', label: 'CONFIG',   Icon: Settings },
  ]

  return (
    <View style={s.bar}>
      {/* top border line */}
      <View style={[s.topLine, { backgroundColor: accent }]} />
      {tabs.map(({ name, label, Icon }) => {
        const focused = state.routes[state.index].name === name
        return (
          <TouchableOpacity
            key={name}
            style={s.tab}
            onPress={() => navigation.navigate(name)}
            activeOpacity={0.6}
          >
            {focused && <View style={[s.activeBar, { backgroundColor: accent }]} />}
            <Icon size={20} color={focused ? accent : '#2a2a2a'} />
            <Text style={[s.lbl, focused && { color: accent }]}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#050505',
    borderTopWidth: 0,
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 0,
    position: 'relative',
  },
  topLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    opacity: 0.3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
    paddingTop: 4,
  },
  activeBar: {
    position: 'absolute',
    top: 0, left: '20%', right: '20%',
    height: 1,
  },
  lbl: {
    color: '#2a2a2a',
    fontSize: 7,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
})