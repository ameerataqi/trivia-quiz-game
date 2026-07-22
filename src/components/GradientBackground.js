import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '../constants/theme';

/**
 * Full-screen gradient backdrop with decorative blurred "bubbles" behind the
 * content. Wraps children in a SafeAreaView so nothing sits under a notch.
 */
export function GradientBackground({ variant = 'home', children, style, edges = ['top', 'bottom'] }) {
  const stops = gradients[variant] || gradients.home;

  return (
    <LinearGradient
      colors={stops}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <View pointerEvents="none" style={styles.decorLayer}>
        <View style={[styles.bubble, styles.bubbleOne]} />
        <View style={[styles.bubble, styles.bubbleTwo]} />
        <View style={[styles.bubble, styles.bubbleThree]} />
      </View>

      <SafeAreaView style={[styles.fill, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.overlay,
  },
  bubbleOne: {
    width: 260,
    height: 260,
    top: -90,
    right: -70,
  },
  bubbleTwo: {
    width: 180,
    height: 180,
    bottom: 60,
    left: -70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bubbleThree: {
    width: 120,
    height: 120,
    top: '42%',
    right: -40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

export default GradientBackground;
