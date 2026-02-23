import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

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
      }}
    >
      {/* Drag handle */}
      <DragIndicatorIcon
        sx={{ cursor: "grab", color: "text.secondary" }}
      />

      {/* Video info */}
      <Box sx={{ flexGrow: 1 }}>
        <ListItemText
          primary={video.videourl}
          secondary={`Start: ${video.startTime || 0}s • End: ${
            video.endTime || 0
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
      </Box>

      {/* Play / Stop */}
      {!isPlaying ? (
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

      {/* Edit */}
      <IconButton onClick={() => onEdit(index)}>
        <EditIcon />
      </IconButton>

      {/* Delete */}
      <IconButton onClick={() => onDelete(index)}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
}