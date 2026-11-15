import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import videoReducer from '../features/video/videoSlice';
import lhlReducer from '../features/lhl/lhlSlice';

export const store = configureStore({
  reducer: {
  auth: authReducer,
  user:userReducer,
  video: videoReducer,
  lhl: lhlReducer,
  },
});