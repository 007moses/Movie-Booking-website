import { configureStore } from '@reduxjs/toolkit';
import theatersReducer from './Slices/theatersSlice';

export const store = configureStore({
  reducer: {
    theaters: theatersReducer,
  },
});