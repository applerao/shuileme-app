import { configureStore } from '@reduxjs/toolkit';

// 导入 reducers（后续添加）
// import userReducer from './slices/userSlice';
// import sleepReducer from './slices/sleepSlice';
// import socialReducer from './slices/socialSlice';

export const store = configureStore({
  reducer: {
    // 用户相关
    // user: userReducer,
    // 睡眠数据
    // sleep: sleepReducer,
    // 社交相关
    // social: socialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些 action 类型
        ignoredActions: [],
        // 忽略 state 中的某些路径
        ignoredPaths: [],
      },
    }),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
