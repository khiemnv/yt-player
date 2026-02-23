import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl,
  Stack
} from "@mui/material";
import { Add, MoreVert } from "@mui/icons-material";

import { createPlaylist, getAllPlaylists, removePlaylist, updatePlaylist } from "../services/search/videoApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectToken } from "../features/auth/authSlice";
import { addPlaylist, deletePlaylist, editPlaylist, selectAllPlaylists, setPlaylists } from "../features/video/videoSlice";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
// import { Timestamp } from "firebase/firestore";


export default function PlaylistDashboard() {
  const playlists = useAppSelector(selectAllPlaylists);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("dateCreated");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    dateCreated: Date.now(),
    note: ""
  });

  const uid = useAppSelector(selectToken);
  console.log("User ID:", uid);

  const dispatch = useAppDispatch();

  // ? Realtime listener
  useEffect(() => {
    const load = async () => {
      if (!uid) return;

      const {result} = await getAllPlaylists(uid);
      console.log("Fetched playlists:", result);
      if (result) {
        dispatch(setPlaylists({allPlaylists: result}));
      } else {
        console.error("Failed to fetch playlists for user ID:", uid);
      }
    }
    load();
  }, [dispatch, uid]);

  // ? Search + Sort
  const filtered = useMemo(() => {
    return playlists
      .filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortField === "title") {
          return a.title.localeCompare(b.title);
        }

        const dateA = a.dateCreated || new Date(0);
        const dateB = b.dateCreated || new Date(0);

        return dateB - dateA;
      });
  }, [playlists, search, sortField]);
  console.log("Filtered playlists:", filtered);

  const handleSave = async () => {
    if (!uid || !form.title) return;

    if (editing) {
      // await updateDoc(doc(db, "users", uid, "playlists", editing), form);
      const changes = { };
      if (editing.title !== form.title) {
        changes.title = form.title;
      }
      if (editing.note !== form.note) {
        changes.note = form.note;
      }
      if (editing.dateCreated !== form.dateCreated) {
        changes.dateCreated = form.dateCreated;
      }

      await updatePlaylist(editing.id, changes);
      dispatch(editPlaylist({ id: editing.id, changes }));
    } else {
      const {result} = await createPlaylist(uid, form);
      // await addDoc(collection(db, "users", uid, "playlists"), form);
      dispatch(addPlaylist({ playlist: result }));
    }

    setOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    // await deleteDoc(doc(db, "users", uid, "playlists", selectedId));
    const {result} = await removePlaylist(selectedId);
    if (result) {
      dispatch(deletePlaylist({ playlistId: selectedId }));
    } else {
      console.error("Failed to delete playlist with ID:", selectedId);
    }
    setMenuAnchor(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
         {"🎵 My Playlists"}
        </Typography>

        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <FormControl size="small">
          <InputLabel>Sort</InputLabel>
          <Select
            value={sortField}
            label="Sort"
            onChange={e => setSortField(e.target.value)}
          >
            <MenuItem value="dateCreated">Date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setForm({ title: "", dateCreated: Date.now(), note: "" });
            setEditing(null);
            setOpen(true);
          }}
        >
          Add
        </Button>
      </Box>

      {/* Playlist Cards */}
      <Stack spacing={2}>
  {filtered.map(p => (
    <Card
      key={p.id}
      sx={{
        position: "relative",
        cursor: "pointer",
        "&:hover": { boxShadow: 6 }
      }}
      onClick={() => navigate(`/playlists/${p.id}`)}
    >
      <IconButton
        sx={{ position: "absolute", right: 8, top: 8 }}
        onClick={(e) => {
          e.stopPropagation(); // 🔥 QUAN TRỌNG
          setMenuAnchor(e.currentTarget);
          setSelectedId(p.id);
        }}
      >
        <MoreVert />
      </IconButton>

      <CardContent>
        <Typography variant="h6">{p.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(p.dateCreated)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {p.note}
        </Typography>
      </CardContent>
    </Card>
  ))}
</Stack>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            const p = playlists.find(x => x.id === selectedId);
            setForm(p);
            setEditing(p);
            setOpen(true);
            setMenuAnchor(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? "Edit Playlist" : "Add Playlist"}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            
        <DatePicker
            label="Date Created"
            format="DD/MM/YYYY"
            value={form.dateCreated ? dayjs(form.dateCreated) : null}
            onChange={(newValue) =>
              setForm({
                ...form,
                dateCreated: newValue ? newValue.toISOString() : null
              })
            }
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2 }
              }
            }}
          />
          </LocalizationProvider>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note"
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const formatDate = (timestamp) => {
  if (!timestamp) return "";

  const date =  new Date(timestamp);
  return date.toLocaleDateString("en-GB");

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
const toInputDate = (timestamp) => {
  if (!timestamp) return "";

  const date =  new Date(timestamp);
  return date.toLocaleDateString("en-GB");

  return date.toISOString().split("T")[0];
};