import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import TeamSetupScreen from '../screens/TeamSetupScreen';
import BattleScreen from '../screens/BattleScreen';
import BattleResultsScreen from '../screens/BattleResultsScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

/** Transparent nav theme so each screen's own gradient shows through. */
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.backdrop,
    card: colors.backdrop,
    primary: colors.primary,
    text: colors.textOnDark,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.backdrop },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ animation: 'fade_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="TeamSetup" component={TeamSetupScreen} />
        <Stack.Screen
          name="Battle"
          component={BattleScreen}
          options={{ animation: 'fade_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="BattleResults"
          component={BattleResultsScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
