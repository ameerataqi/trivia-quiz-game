import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';

/**
 * Counts from the previous value up to the new one instead of snapping.
 * Uses an Animated listener because text content itself cannot be driven
 * natively — the duration is short enough that this stays cheap.
 */
export function AnimatedNumber({ value, duration = 600, style, prefix = '', suffix = '' }) {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setDisplay(Math.round(v)));

    const animation = Animated.timing(animated, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    return () => {
      animation.stop();
      animated.removeListener(id);
    };
  }, [value, duration, animated]);

  return (
    <Text style={style} numberOfLines={1}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </Text>
  );
}

export default AnimatedNumber;
