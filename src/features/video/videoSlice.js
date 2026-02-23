import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: [],
  videos: [],
  currentPlaylist: null,
};

export const slice = createSlice({
  name: "video",
  initialState,
  reducers: {
    editPlaylist: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.playlists.findIndex((t) => t.id === id);
      if (idx !== -1) {
        Object.assign(state.playlists[idx], changes);
      }
    },
    addPlaylist: (state, action) => {
      const { playlist } = action.payload;
      if (!state.playlists.find(t=>t.id === playlist.id)) {
        state.playlists.push(playlist);
      }
    },
    deletePlaylist: (state, action) => {
      const { playlistId } = action.payload;
      const index = state.playlists.findIndex(t=>t.id === playlistId)
      if (index !== -1) {
        state.playlists.splice(index,1);
      }
    },
    setPlaylists: (state, action) => {
      const { allPlaylists } = action.payload;
      state.playlists = allPlaylists; 
    },

    setCurrentPlaylist: (state, action) => {
      const { playlistId } = action.payload;
      state.currentPlaylist = playlistId;
    },
    
    editVideo: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.videos.findIndex((t) => t.id === id);
      if (idx !== -1) {
        Object.assign(state.videos[idx], changes);
      }
    },
    addVideo: (state, action) => {
      const { video } = action.payload;
      if (!state.videos.find(t=>t.id === video.id)) {
        state.videos.push(video);
      }
    },
    deleteVideo: (state, action) => {
      const { videoId } = action.payload;
      const index = state.videos.findIndex(t=>t.id === videoId)
      if (index !== -1) {
        state.videos.splice(index,1);
      }
    },
    setVideos: (state, action) => {
      const { allVideos } = action.payload;
      state.videos = allVideos; 
    }
  },
});

export const {
  editPlaylist,
  addPlaylist,
  deletePlaylist,
  setPlaylists
} = slice.actions;
export const selectAllPlaylists = (state) => state.video.playlists;
export const selectModePara = (state, mode) => mode;
export const selectModePlaylistsPara = (state, mode, ids) => ids;
export const selectCurrentPlaylist = (state) => state.video.currentPlaylist;
export const makeSelectPlaylistById = () =>
  createSelector(
    [selectAllPlaylists, (_, playlistId) => playlistId],
    (playlists, playlistId) =>
      playlists.find(p => p.id === playlistId)
  );
export default slice.reducer;

function patch(entity,changes) {
  Object.keys(changes).forEach((key) => (entity[key] = changes[key]));
}

