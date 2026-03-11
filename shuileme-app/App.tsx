import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';
import { initWeChat } from './src/utils/wechat';

/**
 * 睡了么 App 入口
 * ShuiLeMe - Sleep Tracking App
 */
export default function App() {
  // 初始化微信 SDK
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initWeChat();
        console.log('应用初始化完成，微信 SDK 已加载');
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary.midnightBlue}
          translucent={false}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
