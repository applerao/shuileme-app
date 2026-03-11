import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  PanResponder,
} from 'react-native';

interface CheckinButtonProps {
  type: 'bedtime' | 'wakeup';
  onPress: () => void;
  disabled?: boolean;
  longPressDuration?: number;
}

const CheckinButton: React.FC<CheckinButtonProps> = ({
  type,
  onPress,
  disabled = false,
  longPressDuration = 2000,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const config = {
    bedtime: {
      label: '睡前打卡',
      icon: '🌙',
      bgColor: '#2c3e50',
      activeBgColor: '#3498db',
      textColor: '#ffffff',
    },
    wakeup: {
      label: '起床打卡',
      icon: '☀️',
      bgColor: '#f39c12',
      activeBgColor: '#e74c3c',
      textColor: '#ffffff',
    },
  };

  const buttonConfig = config[type];

  const startPress = () => {
    if (disabled) return;
    
    setIsPressed(true);
    Vibration.vibrate(50); // Initial vibration
    
    // Animate progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: longPressDuration,
      useNativeDriver: false,
    }).start(() => {
      // Complete - trigger checkin
      Vibration.vibrate([0, 200]); // Success vibration
      onPress();
      resetPress();
    });
  };

  const cancelPress = () => {
    if (disabled) return;
    
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    // Reset animation
    progressAnim.setValue(0);
    setIsPressed(false);
    setProgress(0);
  };

  const resetPress = () => {
    progressAnim.setValue(0);
    setIsPressed(false);
    setProgress(0);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startPress();
    },
    onPanResponderRelease: () => {
      if (isPressed && progress < 1) {
        cancelPress();
      }
    },
    onPanResponderTerminate: () => {
      if (isPressed && progress < 1) {
        cancelPress();
      }
    },
  });

  const interpolateColor = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [buttonConfig.bgColor, buttonConfig.activeBgColor],
  });

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        {
          backgroundColor: interpolateColor,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={1}
        onPressIn={startPress}
        onPressOut={cancelPress}
        style={styles.button}
        delayLongPress={longPressDuration}
        onLongPress={onPress}
      >
        <Text style={styles.icon}>{buttonConfig.icon}</Text>
        <Text style={styles.label}>{buttonConfig.label}</Text>
        <Text style={styles.instruction}>长按 2 秒</Text>
        
        {/* Progress Ring */}
        {isPressed && (
          <Animated.View
            style={[
              styles.progressRing,
              {
                transform: [
                  {
                    scale: progressAnim,
                  },
                ],
                opacity: progressAnim,
              },
            ]}
          />
        )}
      </TouchableOpacity>
      
      {/* Progress Bar */}
      {isPressed && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: buttonConfig.activeBgColor,
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
};

// Add View import
import { View } from 'react-native';

const styles = StyleSheet.create({
  buttonWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 40,
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  progressRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    opacity: 0.5,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default CheckinButton;
