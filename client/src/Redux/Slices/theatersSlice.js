import { createSlice } from '@reduxjs/toolkit';

const theatersSlice = createSlice({
  name: 'theaters',
  initialState: {
    theaters: [],
    loading: false,
    error: null,
  },
  reducers: {
    setTheaters(state, action) {
      state.theaters = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setError(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.theaters = [];
    },
  },
});

export const { setTheaters, setLoading, setError } = theatersSlice.actions;
export default theatersSlice.reducer;