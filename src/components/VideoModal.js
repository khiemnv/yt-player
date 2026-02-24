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
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";

function VideoModal({
  open,
  onClose,
  onSave,
  base = {
    videourl: "",
    startTime: "",
    endTime: "",
    repeate: false,
  },
  mode = "add"
}) {
  const [editForm, setEditForm] = useState(base);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!editForm.videourl) return;

    onSave(editForm);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{mode = "add" ? "Add Video" : "Edit Video"}</DialogTitle>

      <DialogContent>
        <VideoForm videoInfo={editForm} handleChange={handleChange} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VideoModal;
const secondsToDayjs = (seconds) => {
  if (!seconds) return dayjs().startOf("day");
  return dayjs().startOf("day").add(seconds, "second");
};

const dayjsToSeconds = (value) => {
  if (!value) return 0;
  return (
    value.hour() * 3600 +
    value.minute() * 60 +
    value.second()
  );
};
function VideoForm({ videoInfo, handleChange }) {
  return <Stack spacing={2} sx={{ mt: 1 }}>
    <TextField
      label="Video URL"
      name="videourl"
      value={videoInfo.videourl}
      onChange={handleChange}
      required
      fullWidth />

    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

        <TimePicker
          label="Start Time"
          views={["hours", "minutes", "seconds"]}
          format="HH:mm:ss"
          value={secondsToDayjs(videoInfo.startTime)}
          onChange={(newValue) => {
            const target = {
              name: "startTime",
              value: dayjsToSeconds(newValue),  
              type: "text"
            };
            handleChange({target});
          }
          }
          slotProps={{ textField: { fullWidth: true } }}
        />

        <TimePicker
          label="End Time"
          views={["hours", "minutes", "seconds"]}
          format="HH:mm:ss"
          value={secondsToDayjs(videoInfo.endTime)}
          onChange={(newValue) => {
            const target = {
              name: "endTime",
              value: dayjsToSeconds(newValue),
              type: "text"
            };
            handleChange({target});
          }
          }
          slotProps={{ textField: { fullWidth: true } }}
        />

      </Stack>
    </LocalizationProvider>

    <FormControlLabel
      control={<Checkbox
        checked={videoInfo.repeate}
        name="repeate"
        onChange={handleChange} />}
      label="Repeat" />
  </Stack>;
}


function editModal(editModalOpen, setEditModalOpen, editForm, setEditForm, setPlaylist, editingIdx, setEditingIdx, onSave) {
  return <Dialog
    open={editModalOpen}
    onClose={() => setEditModalOpen(false)}
    maxWidth="sm"
    fullWidth
  >
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
        onClick={onSave}
      >
        Lưu
      </Button>
    </DialogActions>
  </Dialog>;
}