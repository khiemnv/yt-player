import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Box,
  Stack,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ItemType = "playlistItem";

export function PlaylistItem({
  video,
  index,
  moveItem,
  onEdit,
  onDelete,
  onPlay,
  onStop,
  isPlaying,
}) {
  const ref = useRef(null);

  // DROP
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // DRAG
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: video.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  // Hàm rút gọn URL
  const trimUrl = (url, maxLength = 30) => {
    if (!url) return '';
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  const formatSec = (s) => (`${s}s`);


  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openMenu = (e) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const handleEdit = () => {
    closeMenu();
    onEdit(index);
  };
  const handleDel = () => {
    closeMenu();
    onDelete(index);
  }

  const handleDeleteAsk = () => {
    closeMenu();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmOpen(false);
    onDelete(index);
  };

  const [copied, setCopied] = useState(false);
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <ListItem
      ref={ref}
      component={Paper}
      sx={{
        opacity: isDragging ? 0.4 : 1,
        mb: 1,
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: isPlaying ? "2px solid #2e7d32" : "1px solid #e0e0e0",
        backgroundColor: isPlaying ? "#e8f5e9" : "background.paper",
        transition: "all 0.2s ease",
        minWidth: "300px"
      }}
    >
      {/* Drag handle */}
      <DragIndicatorIcon
        sx={{ cursor: "grab", color: "text.secondary" }}
      />

      {/* Video info */}
      {/* <Box sx={{ flexGrow: 1 }}>
        <ListItemText
          primary={
            <span title={video.videourl}>{trimUrl(video.videourl)}</span>
          }
          secondary={`Start: ${video.startTime || 0}s • End: ${video.endTime || 0
            }s • Repeat: ${video.repeate ? "Yes" : "No"}`}
        />

        {isPlaying && (
          <Chip
            label="Playing"
            color="success"
            size="small"
            sx={{ mt: 0.5 }}
          />
        )}
      </Box> */}

      {/* Info */}
      <Stack direction="column" spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>

        <Tooltip title="Click để copy URL" placement="top" arrow>
          <Typography
            variant="subtitle2"
            onClick={() => copyToClipboard(video.videourl)}
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              fontWeight: 600,
              color: isPlaying ? "success.dark" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",              // <- để người dùng thấy có thể click
              userSelect: "none",             // tránh bôi đen
              "&:hover": { textDecoration: "underline" }, // feedback thị giác
            }}
          >
            {/* {video.title ? video.title : trimUrl(video.videourl)} */}
            {video.videourl}
          </Typography>
        </Tooltip>


        <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
          <Chip label={`Start: ${formatSec(video.startTime)}`} size="small" variant="outlined" />
          <Chip label={`End: ${formatSec(video.endTime)}`} size="small" variant="outlined" />
          <Chip
            label={video.repeate ? "Repeat: On" : "Repeat: Off"}
            size="small"
            color={video.repeate ? "primary" : "default"}
            variant={video.repeate ? "filled" : "outlined"}
          />
          {false && isPlaying && (
            <Chip label="Playing" size="small" color="success" sx={{ fontWeight: 600 }} />
          )}
        </Stack>
      </Stack>


        {/* Play / Stop, Edit, Delete */}
        {/* {!isPlaying ? (
          <IconButton
            color="success"
            onClick={() => onPlay(index)}
          >
            <PlayArrowIcon />
          </IconButton>
        ) : (
          <IconButton
            color="error"
            onClick={() => onStop(index)}
          >
            <StopIcon />
          </IconButton>
        )}

        <IconButton onClick={() => onEdit(index)}>
          <EditIcon />
        </IconButton>

        <IconButton onClick={() => onDelete(index)}>
          <DeleteIcon />
        </IconButton> */}


      {/* Buttons */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {!isPlaying ? (
          <Tooltip title="Play" arrow>
            <IconButton
              color="success"
              onClick={() => onPlay(index)}
              size="small"
              sx={{
                bgcolor: "success.50",
                "&:hover": { bgcolor: "success.100" },
                border: "1px solid",
                borderColor: "success.light",
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Stop" arrow>
            <IconButton
              color="error"
              onClick={() => onStop(index)}
              size="small"
              sx={{
                bgcolor: "error.50",
                "&:hover": { bgcolor: "error.100" },
                border: "1px solid",
                borderColor: "error.light",
              }}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Menu */}
        <Tooltip title="Tùy chọn" arrow>
          <IconButton onClick={openMenu} size="small" sx={{ ml: 0.5 }}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDel} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      <Snackbar
        open={copied}
        autoHideDuration={1600}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Đã copy URL vào clipboard!
        </Alert>
      </Snackbar>

    </ListItem>
  );
}