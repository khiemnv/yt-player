import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Button,
  Container,
  IconButton,
  List,
  Stack,
  Typography,
  Tooltip,
  useMediaQuery,
  ToggleButton,
  Dialog,
  DialogContent,
  DialogActions,
  ListItem,
  Paper,
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ReactPlayer from 'react-player'
import { PlaylistItem } from "./PlaylistItem";
import VideoModal from "./VideoModal";
import SaveIcon from "@mui/icons-material/Save";
import { createPlaylist, updatePlaylist } from "../services/search/videoApi";
import { useSelector } from "react-redux";
import { addPlaylist, makeSelectPlaylistById } from "../features/video/videoSlice";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RepeatIcon from "@mui/icons-material/Repeat";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from '@mui/icons-material/Close';
import Linkify from 'linkify-react';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectToken } from "../features/auth/authSlice";
import { Navigate, useNavigate } from "react-router-dom";

const isPlaylistChanged = (a = [], b = []) => {
  if (a.length !== b.length) return true;

  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];

    if (
      itemA.videourl !== itemB.videourl ||
      Number(itemA.startTime) !== Number(itemB.startTime) ||
      Number(itemA.endTime) !== Number(itemB.endTime) ||
      itemA.repeate !== itemB.repeate
    ) {
      return true;
    }
  }

  return false;
};
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
  const navigate = useNavigate();
  const uid = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const selectPlaylist = useMemo(makeSelectPlaylistById, []);
  const currentPlaylist = useSelector(state =>
    selectPlaylist(state, playlistId)
  );

  const [originalPlaylist, setOriginalPlaylist] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.videos) {
      const videoList = JSON.parse(currentPlaylist.videos);
      setOriginalPlaylist(videoList);
      setPlaylist(videoList.map(element => ({ ...element, id: crypto.randomUUID() })));
    }
  }, [currentPlaylist]);

  const [editingIdx, setEditingIdx] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [repeatAll, setRepeatAll] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(false);

  const playerRef = useRef(null);
  const timeUpdateRef = useRef(null);

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
    setPlaying(true);
  };

  const [playing, setPlaying] = useState(false);

  const nextOrStopOne = useCallback(() => {
    if (playingVideo.repeate) {
      playerRef.current.currentTime = (playingVideo.startTime || 0);
    } else {
      setPlayingVideo(null);
      setPlaying(false);
    }
  }, [playingVideo]);

  const onStopOne = useCallback(() => {
    console.log("Video ended");
    nextOrStopOne();
  }, [nextOrStopOne])

  const handleStop = useCallback(() => {
    setPlayingVideo(null);
    setPlaying(false);
  }, [])

  const stopAllOrNext = useCallback(() => {
    const nextIdx = queueIdx + 1;
    if (nextIdx >= queue.length) {
      if (repeatAll) {
        console.log("Restarting playlist from beginning...");
        if (queue.length === 1) {
          playerRef.current.currentTime = (queue[0].startTime || 0);
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
  }, [queue, queueIdx, repeatAll]);

  const onStopAll = useCallback(() => {
    console.log("Video ended");
    stopAllOrNext();
  }, [stopAllOrNext])

  const extractVideos = (playlist) => {
    return JSON.stringify(playlist.map(({ videourl, startTime, endTime, repeate }) => ({
      videourl, startTime, endTime, repeate
    })))
  }

  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const handleSavePlaylist = async () => {
    const { result, error } = await updatePlaylist(playlistId, {
      videos: extractVideos(playlist)
    });
    if (result) {
      console.log("Playlist saved successfully!");
    } else {
      console.log("Failed to save playlist: " + error);
    }
  };

  const handleClonePlaylist = async () => {
    const clone = {
      ...currentPlaylist,
      videos: extractVideos(playlist)
    };
    delete clone.id;
    const { result } = await createPlaylist(uid, clone);
    if (result) {
      dispatch(addPlaylist({ playlist: result }));
      navigate(`/playlists/${result.id}`);
    } else {
      console.log("Clone playlist error!")
    }
  }

  const handleEditVideoSave = (videoInfo) => {
    // Cập nhật playlist
    setPlaylist(pl => pl.map((item, idx) => (idx === editingIdx ? { ...videoInfo } : item)));
    setEditingIdx(null);
  };
  const handleAddVideoSave = (videoInfo) => setPlaylist((pl) => [
    ...pl,
    { id: crypto.randomUUID(), ...videoInfo }
  ])

  const isDirty = useMemo(
    () => isPlaylistChanged(playlist, originalPlaylist),
    [playlist, originalPlaylist]
  );


  return (
    <Box sx={{
      display: "flex",
      width: "100%",
      flexDirection: "column"
    }}>
      {/* title */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
        }}
      >

        {/* Save Playlist| Clone */}
        {
          (currentPlaylist.owner !== uid) ? <Tooltip
            title={"Clone Playlist"}
          >
            <span>
              <IconButton
                color="primary"
                onClick={handleClonePlaylist}
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main"
                }}
              >
                <ContentCopyIcon  />
              </IconButton>
            </span>
          </Tooltip> : <Tooltip
            title={isDirty ? "Save Playlist" : "No changes"}
          >
            <span>
              <IconButton
                color="primary"
                onClick={handleSavePlaylist}
                disabled={!isDirty}
                sx={{
                  border: "1px solid",
                  borderColor: isDirty ? "primary.main" : "divider"
                }}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
        }

        <PlaylistTitle currentPlaylist={currentPlaylist} />
      </Box>

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
          justifyContent: isMobile ? "center" : "flex-start",
          alignItems: isMobile ? "center" : "flex-start"
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
                      isPlaying={video.id === playingVideo?.id || video.id === queue[queueIdx]?.id}
                    />
                  ))}

                  <ListItem
                    component={Paper}
                    sx={{
                      mb: 1,
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      border: "1px solid #e0e0e0",
                      backgroundColor: "background.paper",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {/* Add Video */}
                    <Tooltip title="Add Video">
                      <IconButton
                        color="primary"
                        onClick={() => setAddVideoOpen(true)}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider"
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
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
              onStop={onStopOne}
              count={playingVideo.count || 0} />
          )}
          {queueIdx !== null && queue[queueIdx] && (
            <PlayVideoBox
              playerRef={playerRef}
              video={queue[queueIdx]}
              onStop={onStopAll}
            />
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
          onStop={() => {
            setQueueIdx(null);
            setPlaying(false);
          }}
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

const PlayVideoBox = React.memo(function PlayVideoBox({ playerRef, video, onPause, onPlay, onStop, count }) {
  console.log("PlayVideoBox: ", video.id, count);
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(null);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    setSrc(video.videourl);
    setPlaying(true);
    setMuted(true);
  }, [video.id, video.videourl]);

  const handlePlay = () => {
    console.log("PlayVideoBox started");
    const start = video.startTime
    if (start) {
      if (playerRef.current.currentTime < start) {
        playerRef.current.currentTime = start;
      }
    }
    setMuted(false);
    onPlay?.();
  }
  const handlePause = () => {
    console.log("PlayVideoBox paused");
    onPause?.();
  }
  const handleEnd = () => {
    console.log("PlayVideoBox ended");
    onStop?.();
  }
  const handleTimeUpdate = () => {
    // Khi đạt đến end (nếu có), dừng video
    if (video.endTime && playerRef.current.currentTime >= video.endTime) {
      console.log("PlayVideoBox reached endTime");
      setPlaying(false);
      setSrc(null); // reset src
      setTimeout(() => {
        onStop?.();
      }, 100);
    }
  }
  const handleReady = () => {
    console.log("PlayVideoBox ready");
  }

  return <Box sx={{
    m: 2,
    display: "flex",
    flexDirection: "column",
    width: "100%"
  }}>
    <Typography variant="h6">Now Playing</Typography>
    <ReactPlayer
      ref={playerRef}
      src={src}
      playing={playing}
      playsInline={true}
      muted={muted}
      start={video.startTime}
      end={video.endTime}
      controls
      onPause={handlePause}
      onPlay={handlePlay}
      onEnded={handleEnd}
      onTimeUpdate={handleTimeUpdate}
      // Bắt đầu từ start
      progressInterval={500} // kiểm tra mỗi 500ms
      // Để tự động seek đến start, có thể dùng hàm onReady
      onReady={handleReady}
      style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
    />
  </Box>;
})
function PlaylistTitle({ currentPlaylist }) {
  const [infoOpen, setInfoOpen] = useState(false);

  return <><Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      m: 2
    }}
  >
    {currentPlaylist?.note && (
      <Tooltip
        title={"Note"}
      >
        <span>
          <IconButton
            onClick={() => setInfoOpen(true)}
            sx={{
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>
    )}

    <Typography variant="h4">
      {currentPlaylist?.title || "Playlist Manager"}
    </Typography>
  </Box>
    <Dialog
  open={infoOpen}
  onClose={() => setInfoOpen(false)}
  maxWidth="sm"
  fullWidth
>
  {/* Close button on top right */}
  <Box
    sx={{
      position: 'absolute',
      right: 8,
      top: 8,
      zIndex: 1,
    }}
  >
    <IconButton
      aria-label="close"
      onClick={() => setInfoOpen(false)}
      size="large"
    >
      <CloseIcon />
    </IconButton>
  </Box>

  {/* Nếu muốn có tiêu đề, bạn có thể thêm DialogTitle ở đây */}
  {/* <DialogTitle>Playlist Note</DialogTitle> */}

  <DialogContent dividers>
    <Typography
      variant="body1"
      sx={{ whiteSpace: "pre-line" }}
      component="div"
    >
      <Linkify
        options={{
          target: '_blank',
          rel: 'noopener noreferrer',
        }}
      >
        {currentPlaylist?.note || "No note available."}
      </Linkify>
    </Typography>
  </DialogContent>
{/* 
  <DialogActions>
    <Button onClick={() => setInfoOpen(false)}>
      Close
    </Button>
  </DialogActions> */}
</Dialog>
  </>;
}

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

