import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  List,
  Stack,
  Typography,
  FormControlLabel,
  Tooltip,
  useMediaQuery,
  ToggleButton,
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import ReactPlayer from 'react-player'
import { PlaylistItem } from "./PlaylistItem";
import VideoModal from "./VideoModal";
import SaveIcon from "@mui/icons-material/Save";
import { getPlaylist, updatePlaylist } from "../services/search/videoApi";
import { useSelector } from "react-redux";
import { addPlaylist, makeSelectPlaylistById } from "../features/video/videoSlice";
import AddIcon from "@mui/icons-material/Add";

import RepeatIcon from "@mui/icons-material/Repeat";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useAppDispatch } from "../app/hooks";
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
function PlaylistManager({ playlistId }) {
  const dispatch = useAppDispatch();
  const selectPlaylist = useMemo(makeSelectPlaylistById, []);
  const currentPlaylist = useSelector(state =>
    selectPlaylist(state, playlistId)
  );

  const [playlist, setPlaylist] = useState(() => {
    if (currentPlaylist && currentPlaylist.videos) {
      const videoList = JSON.parse(currentPlaylist.videos);
      videoList.forEach(element => {
        element.id = crypto.randomUUID()
      });
      return videoList;
    }
    return [];
  });
  const [editingIdx, setEditingIdx] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [repeatAll, setRepeatAll] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(false);

  const playerRef = useRef(null);
  const delay = 2000;
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState(false);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  const handleEdit = (idx) => {
    setEditingIdx(idx);
  };

  const handleDelete = (idx) => {
    setPlaylist((pl) => pl.filter((_, i) => i !== idx));
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
  const [playing, setPlaying] = useState(false);

  const onPause = useCallback(() => {
    setPlaying(false);
    console.log("Video paused")
  }, [])
  const onStop = useCallback(() => console.log("Video ended"), [])
  const onPlay = useCallback(() => {
    console.log("Video started");
    console.log(playerRef.current);
    setPlaying(true);
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
    setValue(playerRef.current.currentTime);
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
        setPlaying(false);
      }
    }
  }, [playingVideo]);

  const handleStop = useCallback(() => {
    setPlayingVideo(null);
    setPlaying(false);
  }, [])

  const onPlayAll = useCallback(() => {
    console.log("Video started");
    setPlaying(true);
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
            setPlaying(false);
          }
        } else {
          // play next video
          setQueueIdx(queueIdx + 1);
        }
      }
    }
  }, [queue, queueIdx, repeatAll]);

  const [addVideoOpen, setAddVideoOpen] = useState(false);
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

  const handleEditVideoSave = (videoInfo) => {
    // Cập nhật playlist
    setPlaylist(pl => pl.map((item, idx) => (idx === editingIdx ? { ...videoInfo } : item)));
    setEditingIdx(null);
  };
  const handleAddVideoSave = (videoInfo) => setPlaylist((pl) => [
    ...pl,
    { id: crypto.randomUUID(), ...videoInfo }
  ])

  
  console.log("debounced: ", debounced);

  return (
    <Box sx={{
      display: "flex",
      width: "100%",
      flexDirection: "column"
    }}>
      {/* title */}
      <Typography variant="h4" gutterBottom margin={2}>
        {currentPlaylist?.title || "Playlist Manager"}
      </Typography>

      {/* body layout
      +---------+----------+
      |playlist | play area| 
      +---------+----------+
      */}
      <Box
        display="flex"
        flexGrow={1}
        flexDirection={isMobile ? "column" : "row"}
        sx={{
          minWidth: "300px",
          minHeight: "300px",
          maxWidth: isMobile ?
            "100vw" : "100vw",
          justifyContent: isMobile ? "center" : "flex-start"
        }}
      >

        {/* playlist control bar */}
        <Box sx={{
          maxWidth: isMobile ? "fit-content" : "500px",
          flexGrow: isMobile ? 10 : 0,
          display: "flex",
          flexDirection: "column",
          overflow: "auto"
        }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            {/* add button */}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddVideoOpen(true)}
            >
              Add Video
            </Button>
            {(true) ? (
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


          <Box sx={{
            display: "flex",
            flexGrow: 1,
            minHeight: "200px",
            overflowY: "scroll",
            p: 0,
          }}>
            <DndProvider backend={HTML5Backend}>
              <Container sx={{
                p: 0,
              }}>

                {/* videos list với drag-and-drop, edit, delete, play */}
                <List>
                  {playlist.map((video, idx) => (
                    <PlaylistItem
                      key={video.id ?? idx} // ✅ stable key
                      video={video}
                      index={idx}
                      moveItem={moveItem}
                      onEdit={() => handleEdit(idx)}
                      onDelete={handleDelete}
                      onPlay={() => handlePlay(video)}
                      onStop={handleStop}
                      isPlaying={playingVideo !== null && playingVideo.id === video.id}
                    />
                  ))}
                </List>

              </Container>
            </DndProvider>
          </Box>


        </Box>

        {/* play area  */}
        <Box sx={{
          display: "flex",
          flexGrow: 10,
          alignItems: "center",
          justifyContent: "center"
        }}>
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
        </Box>

      </Box>

      {/* footter */}
      {/* playall, shuffle, repeat all */}
      <Box sx={{ p: 2 }}>
        <PlayMode startPlayAll={startPlayAll}
          playlist={playlist}
          repeatAll={repeatAll}
          setRepeatAll={setRepeatAll}
          shuffle={shuffle}
          setShuffle={setShuffle}
          isPlaying={playing}
          onStop={() => { setQueueIdx(null); setPlaying(false); }}
          onNext={() => {
            const nextIdx = queueIdx + 1;
            if (nextIdx >= queue.length) {
              return;
            } else {
              setQueueIdx(nextIdx);
            }
          }}
          onPrev={() => {
            const nextIdx = queueIdx - 1;
            if (nextIdx >= 0) {
              return;
            } else {
              setQueueIdx(nextIdx);
            }
          }}
        />
      </Box>

      {/* form thêm video */}
      {addVideoOpen && <VideoModal
        open={addVideoOpen}
        onClose={() => setAddVideoOpen(false)}
        onSave={handleAddVideoSave}
      />}

      {(editingIdx !== null) && <VideoModal
        open={true}
        onClose={() => setEditingIdx(null)}
        onSave={handleEditVideoSave}
        base={playlist[editingIdx]}
      />}

    </Box>
  );


}



export default PlaylistManager;

const PlayVideoBox = React.memo(function PlayVideoBox({ playerRef, video, onPause, onPlay, onStop, handleProgress, onReady, count }) {
  console.log("PlayVideoBox: ", video.id, count);
  return <Box sx={{
    m: 2,
    display: "flex",
    flexDirection: "column",
    width: "100%"
  }}>
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

function PlayMode({
  startPlayAll,
  playlist,
  repeatAll,
  setRepeatAll,
  shuffle,
  setShuffle,
  onPrev,
  onNext,
  onStop,
  isPlaying
}) {

  // Toggle handlers
  const handleShuffleToggle = () => setShuffle(!shuffle);
  const handleRepeatToggle = () => setRepeatAll(!repeatAll);

  const isEmpty = useMemo(() => !playlist || playlist.length === 0, [playlist]);
  return <Stack
    direction="row"
    spacing={2}
    alignItems="center"
    // justifyContent={"space-between"}

  >

    {/* Left: Transport controls */}
    <Stack direction="row" spacing={1} alignItems="center">


      {/* Prev */}
      <Tooltip title="Previous">
        <span>
          <IconButton
            onClick={onPrev}
            disabled={isEmpty || !isPlaying}
            sx={{ border: "1px solid", borderColor: "divider" }}
            size="medium"
          >
            <SkipPreviousIcon />
          </IconButton>
        </span>
      </Tooltip>

      {/* Play All */}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={() => startPlayAll(false)}
        startIcon={<PlaylistPlayIcon />}
        disabled={isEmpty}
        sx={{ minWidth: 132 }}
      >
        Play All
      </Button> */}
      <Tooltip title={isPlaying ? "Play All" : "Stop"}>
        <span>
          <IconButton
            onClick={() => isPlaying ? onStop() : startPlayAll(shuffle)}
            // disabled={isEmpty || !isPlaying}
            sx={{ border: "1px solid", borderColor: "divider" }}
            size="medium"
          >
            {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {/* Next */}
      <Tooltip title="Next">
        <span>
          <IconButton
            onClick={onNext}
            disabled={isEmpty || !isPlaying}
            sx={{ border: "1px solid", borderColor: "divider" }}
            size="medium"
          >
            <SkipNextIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>

    {/* Right: Modes */}
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Shuffle toggle */}
      <Tooltip title={shuffle ? "Shuffle: On" : "Shuffle: Off"}>
        <ToggleButton
          value="shuffle"
          selected={shuffle}
          onChange={handleShuffleToggle}
          disabled={isEmpty}
          size="small"
          sx={{
            px: 1.25,
            borderRadius: 2,
            "&.Mui-selected": {
              bgcolor: "primary.50",
              borderColor: "primary.light",
              color: "primary.main",
              "&:hover": { bgcolor: "primary.100" },
            },
          }}
        >
          <ShuffleIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      {/* Repeat toggle */}
      <Tooltip title={repeatAll ? "Repeat All: On" : "Repeat All: Off"}>
        <ToggleButton
          value="repeat"
          selected={repeatAll}
          onChange={handleRepeatToggle}
          disabled={isEmpty}
          size="small"
          sx={{
            px: 1.25,
            borderRadius: 2,
            "&.Mui-selected": {
              bgcolor: "success.50",
              borderColor: "success.light",
              color: "success.main",
              "&:hover": { bgcolor: "success.100" },
            },
          }}
        >
          <RepeatIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      {/* (Tùy chọn) Nhóm toggle nếu muốn gom */}
      {/* 
        <ToggleButtonGroup exclusive>
          <ToggleButton ...> <ShuffleIcon/> </ToggleButton>
          <ToggleButton ...> <RepeatIcon/> </ToggleButton>
        </ToggleButtonGroup>
        */}
    </Stack>

{/* 
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
    </Button> */}
    {/* <FormControlLabel
      control={<Checkbox
        checked={repeatAll}
        onChange={e => setRepeatAll(e.target.checked)} />}
      label="Lặp lại toàn bộ playlist" /> */}
  </Stack>;
}

