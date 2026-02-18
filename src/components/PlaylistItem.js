import React, { useState, useRef, useCallback } from "react";
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


export function PlaylistItem({ 
  video, index, moveItem, onEdit, onDelete, onPlay, 
  onStop, isPlaying }) {
  const ref = useRef(null);

  // DROP target
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the cursor has crossed half of the item's height
      // Dragging downwards: only move when cursor is below 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards: only move when cursor is above 50%
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Perform the move
      moveItem(dragIndex, hoverIndex);

      // Note: mutate the dragged item to avoid expensive lookups
      item.index = hoverIndex;
    },
  });

  // DRAG source
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: video.id, index }, // use stable id + current index
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // connect drag + drop
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
      {(!isPlaying) ?
        <Button variant="contained" color="success" size="small" onClick={() => onPlay(index)}>
          Play
        </Button>
        : <Button variant="contained" color="success" size="small" onClick={() => onStop(index)}>
          Stop
        </Button>
      }
      <IconButton aria-label="edit" onClick={() => onEdit(index)}>
        <EditIcon />
      </IconButton>
      <IconButton aria-label="delete" onClick={() => onDelete(index)}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
}
