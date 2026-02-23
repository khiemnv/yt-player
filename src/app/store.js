import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import videoReducer from '../features/video/videoSlice';

export const store = configureStore({
  reducer: {
  auth: authReducer,
  user:userReducer,
  video: videoReducer,
  },
});