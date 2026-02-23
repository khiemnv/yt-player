import React, { useState, useRef, useCallback, useMemo } from "react";
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
  Tooltip,
  useMediaQuery,
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
import { PlaylistItem } from "./PlaylistItem";
import AddVideoForm from "./AddVideoModal";
import SaveIcon from "@mui/icons-material/Save";
import { updatePlaylist } from "../services/search/videoApi";
import { useSelector } from "react-redux";
import { makeSelectPlaylistById, selectCurrentPlaylist } from "../features/video/videoSlice";
const ItemType = "playlistItem";


// Hàm trộn mảng sử dụng thuật toán Fisher-Yates
function shuffleArray(array) {
  const arr = [...array]; // sao chép mảng để không làm thay đổi mảng gốc
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // số ngẫu nhiên từ 0 tới i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // hoán đổi vị trí
  }
  return arr;
}
function PlaylistManager({playlistId}) {
  const selectPlaylist = useMemo(makeSelectPlaylistById, []);
  const currentPlaylist = useSelector(state =>
    selectPlaylist(state, playlistId)
  );
  const [playlist, setPlaylist] = useState(()=>{
    if (currentPlaylist && currentPlaylist.videos) {
      return JSON.parse(currentPlaylist.videos);
    }
    return [];
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ videourl: "", startTime: "", endTime: "", repeate: false });
  const [editingIdx, setEditingIdx] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [repeatAll, setRepeatAll] = useState(false);
  const [repeateOne, setRepeateOne] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(false);

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

  const handlePlay = (video) => {
    setQueueIdx(null);
    setPlayingVideo(video);
  }

  const moveItem = (from, to) => {
    const updated = [...playlist];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPlaylist(updated);
  };

  // Hàm play all với hoặc không shuffle
  const startPlayAll = (shuffle) => {
    setPlayingVideo(null);
    if (shuffle) {
      const newList = shuffleArray(playlist); // gọi hàm trộn
      setQueue(newList);
    } else {
      setQueue([...playlist]);
    }
    setQueueIdx(0);
  };

  // Để xử lý start/end, bạn cần truyền start/end vào và sử dụng onProgress
  const [playedSeconds, setPlayedSeconds] = React.useState(0);
  const [playing, setPlaying] = useState(true);

  const onPause = useCallback(() => console.log("Video paused"), [])
  const onStop = useCallback(() => console.log("Video ended"), [])
  const onPlay = useCallback(() => {
    console.log("Video started");
    console.log(playerRef.current)
    const start = playingVideo.startTime
    if (start) {
      if (playerRef.current.currentTime < start) {
        playerRef.current.currentTime = start;
      }
    }
  }, [playingVideo])
  const onReady = useCallback(() => () => {
    console.log("Video ready");
  }, [])

  const handlePlayOneProgress = useCallback((progress) => {
    console.log(playerRef.current.currentTime)
    setPlayedSeconds(playerRef.current.currentTime);
    // Khi đạt đến end (nếu có), dừng video
    if (playingVideo.endTime && playerRef.current.currentTime >= playingVideo.endTime) {
      if (playingVideo.repeate) {
        setPlayingVideo(null);
        setTimeout(() => {
          setPlayingVideo({ ...playingVideo, count: (playingVideo.count || 0) + 1 }); // reset để phát lại
        }, 100);
      } else {
        setPlayingVideo(null);
      }
    }
  }, [playingVideo]);

  const handleStop = useCallback(() => {
    setPlayingVideo(null)
  }, [])

  const onPlayAll = useCallback(() => {
    console.log("Video started");
    // console.log(playerRef.current)
    const start = queue[queueIdx].startTime
    if (start) {
      if (playerRef.current.currentTime < start) {
        playerRef.current.currentTime = start;
      }
    }
  }, [queue, queueIdx])

  const handlePlayAllProgress = useCallback((progress) => {
    // console.log(progress)
    console.log(playerRef.current.currentTime)
    setPlayedSeconds(playerRef.current.currentTime);
    // Khi đạt đến end (nếu có), dừng video
    if (queueIdx !== null) {
      const end = queue[queueIdx].endTime;
      if (end && playerRef.current.currentTime >= end) {
        const nextIdx = queueIdx + 1;
        if (nextIdx >= queue.length) {
          if (repeatAll) {
            console.log("Restarting playlist from beginning...");
            if (queue.length === 1) {
              // playerRef.current.currentTime = queue[0].startTime || 0;
              setQueueIdx(null);
              setTimeout(() => {
                setQueueIdx(0);
              }, 100);
            } else {
              setQueueIdx(0);
            }
          } else {
            setQueueIdx(null);
          }
        } else {
          // play next video
          setQueueIdx(queueIdx + 1);
        }
      }
    }
  }, [queue, queueIdx, repeatAll]);

  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const handleSavePlaylist = async () => {
    const { result, error } = await updatePlaylist(playlistId, {
      videos: JSON.stringify(playlist.map(({ videourl, startTime, endTime, repeate }) => ({
        videourl, startTime, endTime, repeate
      })))
    });
    if (result) {
      console.log("Playlist saved successfully!");
    } else {
      console.log("Failed to save playlist: " + error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container sx={{ py: 1 }}>
        <Typography variant="h4" gutterBottom>
          {currentPlaylist?.title || "Playlist Manager"}
        </Typography>


        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          {/* Left side: play controls */}
          <Box display="flex" alignItems="center" gap={1}>
            {PlayMode(startPlayAll, playlist, repeatAll, setRepeatAll)}
          </Box>

          {/* Right side: save button */}
          {(!isMobile) ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSavePlaylist}
              startIcon={<SaveIcon />}
              disabled={playlist.length === 0}
            >
              Save Playlist
            </Button>
          ) : (
            <Tooltip title="Save Playlist">
              <IconButton
                color="primary"
                onClick={handleSavePlaylist}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}

        </Box>

        {/* form thêm video */}
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Add Video
        </Button>

        <AddVideoForm
          open={open}
          onClose={() => setOpen(false)}
          setPlaylist={setPlaylist}
        />


        {/* videos list với drag-and-drop, edit, delete, play */}
        <List>
          {playlist.map((video, idx) => (
            <PlaylistItem
              key={video.id ?? video.videourl} // ✅ stable key
              video={video}
              index={idx}
              moveItem={moveItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPlay={() => handlePlay(video)}
              onStop={handleStop}
              isPlaying={playingVideo !== null && playingVideo.id === video.id}
            />
          ))}
        </List>

        {playingVideo !== null && (
          <PlayVideoBox
            playerRef={playerRef}
            video={playingVideo}
            onPause={onPause}
            onPlay={onPlay}
            onStop={onStop}
            handleProgress={handlePlayOneProgress}
            onReady={onReady}
            count={playingVideo.count || 0} />
        )}
        {queueIdx !== null && queue[queueIdx] && (
          <PlayVideoBox
            playerRef={playerRef}
            video={queue[queueIdx]}
            onPause={onPause}
            onPlay={onPlayAll}
            onStop={onStop}
            handleProgress={handlePlayAllProgress}
            onReady={onReady} />
        )}
      </Container>

      {editModal(editModalOpen, setEditModalOpen, editForm, setEditForm, setPlaylist, editingIdx, setEditingIdx)}
    </DndProvider>
  );
}



export default PlaylistManager;

const PlayVideoBox = React.memo(function PlayVideoBox({ playerRef, video, onPause, onPlay, onStop, handleProgress, onReady, count }) {
  console.log("PlayVideoBox: ", video.id, count);
  return <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Now Playing</Typography>
    <ReactPlayer
      ref={playerRef}
      src={video.videourl}
      playing={true}
      start={video.startTime}
      end={video.endTime}
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
  </Box>;
})

function PlayMode(startPlayAll, playlist, repeatAll, setRepeatAll) {
  return <Stack direction="row" spacing={2} alignItems="center">
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
      control={<Checkbox
        checked={repeatAll}
        onChange={e => setRepeatAll(e.target.checked)} />}
      label="Lặp lại toàn bộ playlist" />
  </Stack>;
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
