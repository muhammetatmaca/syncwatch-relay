import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useSyncStore } from './src/store/useSyncStore';
import { Colors } from './src/theme/colors';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { WatchScreen } from './src/screens/WatchScreen';

type CurrentScreen = 'onboarding' | 'home' | 'lobby' | 'watch';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('onboarding');
  const { themeMode } = useSyncStore();
  const c = Colors[themeMode];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.surfaceBase }]} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={c.surfaceBase}
        />

        <View style={[styles.screenContainer, { backgroundColor: c.surfaceBase }]}>
          {currentScreen === 'onboarding' && (
            <OnboardingScreen onFinish={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              onNavigateToLobby={() => setCurrentScreen('lobby')}
              onNavigateToWatch={() => setCurrentScreen('watch')}
              onShowOnboarding={() => setCurrentScreen('onboarding')}
            />
          )}

          {currentScreen === 'lobby' && (
            <LobbyScreen
              onBack={() => setCurrentScreen('home')}
              onEnterWatchRoom={() => setCurrentScreen('watch')}
            />
          )}

          {currentScreen === 'watch' && (
            <WatchScreen
              onLeaveRoom={() => setCurrentScreen('home')}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});