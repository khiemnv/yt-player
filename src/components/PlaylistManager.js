import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ReactPlayer from 'react-player'
const ItemType = "playlistItem";

function PlaylistItem({ video, index, moveItem, onEdit, onDelete, onPlay, onStop }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item) {
      if (item.index === index) return;
      moveItem(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <ListItem
      ref={ref}
      component={Paper}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "#f5f5f5",
      }}
    >
      <DragIndicatorIcon sx={{ cursor: "grab" }} />
      <ListItemText
        primary={video.videourl}
        secondary={`Start: ${video.startTime || 0}s, End: ${video.endTime || 0}s, Repeat: ${video.repeate ? "Yes" : "No"}`}
      />
      <Button variant="contained" color="success" size="small" onClick={() => onPlay(index)}>
        Play
      </Button>
      <Button variant="contained" color="success" size="small" onClick={() => onStop(index)}>
        Stop
      </Button>
      <IconButton aria-label="edit" onClick={() => onEdit(index)}>
        <EditIcon />
      </IconButton>
      <IconButton aria-label="delete" onClick={() => onDelete(index)}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
}

function PlaylistManager() {
  const [playlist, setPlaylist] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ videourl: "", startTime: "", endTime: "", repeate: false });
  const [editingIdx, setEditingIdx] = useState(null);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [repeatAll, setRepeatAll] = useState(false);
  
  const playerRef = useRef(null);

  const handleEdit = (idx) => {
    setEditForm(playlist[idx]);
    setEditingIdx(idx);
    setEditModalOpen(true);
  };

  const handleDelete = (idx) => {
    setPlaylist((pl) => pl.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setEditForm({ videourl: "", startTime: "", endTime: "", repeate: false });
  };

  const moveItem = (from, to) => {
    const updated = [...playlist];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPlaylist(updated);
  };

  const startPlayAll = () => { }

  // Để xử lý start/end, bạn cần truyền start/end vào và sử dụng onProgress
  const [playedSeconds, setPlayedSeconds] = React.useState(0);
  const [playing,setPlaying] = useState(true);
  
  const onPause = () => console.log("Video paused")
  const onStop = () => console.log("Video ended")
  const onPlay = () => {
    console.log("Video started");
    console.log(playerRef.current)
    const start = playlist[playingIdx].startTime
    if (start) {
      if (playerRef.current.currentTime < start) {
        playerRef.current.currentTime = start;
      }
    }
  }
  const onReady = () => () => {
    console.log("Video ready: current", playerRef.current)
    const start = playlist[playingIdx].startTime
    if (start) {
      if (playerRef.current.currentTime < start) {
        playerRef.current.currentTime = start;
      }
    }
  }
function secondsToHHMMSS(seconds) {
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? String(h).padStart(2, "0") : "00",
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}
  const handleProgress = (progress) => {
    // console.log(progress)
    console.log(playerRef.current.currentTime)
    setPlayedSeconds(playerRef.current.currentTime);
    // Khi đạt đến end (nếu có), dừng video
    if (playingIdx !== null) {
      const end = playlist[playingIdx].endTime;
      if (end && playerRef.current.currentTime >= end) {
        // onStop && onStop();
        handleStop();
      }
    }
  };

  const handleStop = () => {
    setPlayingIdx(null)
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Playlist Manager
        </Typography>
        {/* playall, shuffle, repeat all */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => startPlayAll(false)}
            startIcon={<PlaylistPlayIcon />}
            disabled={playlist.length === 0}
          >
            Play All
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => startPlayAll(true)}
            startIcon={<ShuffleIcon />}
            disabled={playlist.length === 0}
          >
            Shuffle
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={repeatAll}
                onChange={e => setRepeatAll(e.target.checked)}
              />
            }
            label="Lặp lại toàn bộ playlist"
          />
        </Stack>
        {/* form thêm video */}
        <AddVideoForm setPlaylist={setPlaylist} />
        <List>
          {playlist.map((video, idx) => (
            <PlaylistItem
              key={idx}
              video={video}
              index={idx}
              moveItem={moveItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPlay={setPlayingIdx}
              onStop={handleStop}
            />
          ))}
        </List>

        {playingIdx !== null && playlist[playingIdx] && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Now Playing</Typography>
            <ReactPlayer 
            ref={playerRef}
            src={playlist[playingIdx].videourl}
              playing={playing}
              start={playlist[playingIdx].startTime}
              end={playlist[playingIdx].endTime}
              controls
              onPause={onPause}
              onPlay={onPlay}
              onEnded={onStop}
              onProgress={handleProgress}
              // Bắt đầu từ start
              progressInterval={500} // kiểm tra mỗi 500ms
              // Để tự động seek đến start, có thể dùng hàm onReady
              onReady={onReady}
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }} />
          </Box>
        )}
      </Container>

      {editModal(editModalOpen, setEditModalOpen, editForm, setEditForm, setPlaylist, editingIdx, setEditingIdx)}
    </DndProvider>
  );
}



export default PlaylistManager;

function AddVideoForm({ setPlaylist }) {
  const [editForm, setEditForm] = useState({
    videourl: "",
    startTime: "",
    endTime: "",
    repeate: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editForm.videourl) return;
    setPlaylist((pl) => [...pl, { ...editForm }]);
    setEditForm({
      videourl: "",
      startTime: "",
      endTime: "",
      repeate: false,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <TextField
          label="Video URL"
          name="videourl"
          variant="outlined"
          size="small"
          value={editForm.videourl}
          onChange={handleChange}
          required
          sx={{ flex: 2 }}
        />
        <TextField
          label="Start (s)"
          name="startTime"
          variant="outlined"
          size="small"
          type="number"
          value={editForm.startTime}
          onChange={handleChange}
          sx={{ width: 110 }}
        />
        <TextField
          label="End (s)"
          name="endTime"
          variant="outlined"
          size="small"
          type="number"
          value={editForm.endTime}
          onChange={handleChange}
          sx={{ width: 110 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editForm.repeate}
              name="repeate"
              onChange={handleChange}
            />
          }
          label="Repeat"
          sx={{ mx: 1 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Add
        </Button>
      </Stack>
    </Box>
  );
}

function editModal(editModalOpen, setEditModalOpen, editForm, setEditForm, setPlaylist, editingIdx, setEditingIdx) {
  return <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
    <DialogTitle>Chỉnh sửa video</DialogTitle>
    <DialogContent>
      <Stack spacing={2} mt={1}>
        <TextField
          label="Video URL"
          name="videourl"
          variant="outlined"
          size="small"
          value={editForm.videourl}
          onChange={e => setEditForm(f => ({ ...f, videourl: e.target.value }))}
          required />
        <TextField
          label="Start (s)"
          name="startTime"
          variant="outlined"
          size="small"
          type="number"
          value={editForm.startTime}
          onChange={e => setEditForm(f => ({ ...f, startTime: e.target.value }))} />
        <TextField
          label="End (s)"
          name="endTime"
          variant="outlined"
          size="small"
          type="number"
          value={editForm.endTime}
          onChange={e => setEditForm(f => ({ ...f, endTime: e.target.value }))} />
        <FormControlLabel
          control={<Checkbox
            checked={editForm.repeate}
            onChange={e => setEditForm(f => ({ ...f, repeate: e.target.checked }))} />}
          label="Repeat" />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => setEditModalOpen(false)}
        color="secondary"
        variant="outlined"
      >
        Hủy
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          // Cập nhật playlist
          setPlaylist(pl => pl.map((item, idx) => (idx === editingIdx ? { ...editForm } : item))
          );
          setEditModalOpen(false);
          setEditingIdx(null);
        }}
      >
        Lưu
      </Button>
    </DialogActions>
  </Dialog>;
}
