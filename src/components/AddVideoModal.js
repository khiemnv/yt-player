import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { useState } from "react";

function AddVideoForm({ open, onClose, setPlaylist }) {
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

  const handleSubmit = () => {
    if (!editForm.videourl) return;

    setPlaylist((pl) => [
      ...pl,
      { id: crypto.randomUUID(), ...editForm }
    ]);

    setEditForm({
      videourl: "",
      startTime: "",
      endTime: "",
      repeate: false,
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add Video</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Video URL"
            name="videourl"
            value={editForm.videourl}
            onChange={handleChange}
            required
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Start (s)"
              name="startTime"
              type="number"
              value={editForm.startTime}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="End (s)"
              name="endTime"
              type="number"
              value={editForm.endTime}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={editForm.repeate}
                name="repeate"
                onChange={handleChange}
              />
            }
            label="Repeat"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddVideoForm;