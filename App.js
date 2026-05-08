import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { StoreProvider } from './store'
import { TabBar } from './components/TabBar'

import HomeTab      from './app/HomeTab'
import SearchTab    from './app/SearchTab'
import LibraryTab   from './app/LibraryTab'
import SettingsTab  from './app/SettingsTab'
import PlayerScreen from './app/PlayerScreen'
import QueueScreen  from './app/QueueScreen'

const Tab   = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab"     component={HomeTab} />
      <Tab.Screen name="SearchTab"   component={SearchTab} />
      <Tab.Screen name="LibraryTab"  component={LibraryTab} />
      <Tab.Screen name="SettingsTab" component={SettingsTab} />
    </Tab.Navigator>
  )
}

function Root() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"   component={Tabs} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Queue"
        component={QueueScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Root />
      </NavigationContainer>
    </StoreProvider>
  )
}