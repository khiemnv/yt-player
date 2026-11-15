import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function suggestKhoi(birthMs) {
  if (!birthMs) return "";

  const age = dayjs().diff(dayjs(birthMs), "year");
  if (age >= 6 && age <= 8) return "K1";
  if (age >= 9 && age <= 11) return "K2";
  if (age >= 12 && age <= 15) return "K3";
  if (age >= 16 && age <= 18) return "K4";
  return "K1";
}

export default function KhoaSinhFormDialog({
  open,
  mode = "create",
  owner,
  item,
  onClose,
  onSubmit,
}) {
  const initial = useMemo(() => {
    const base = item || {};
    const birthMs = base.birthMs || null;
    return {
      name: base.name || "",
      owner: base.owner || owner || "",
      deleted: !!base.deleted,
      birthMs,
      khoi: base.khoi || suggestKhoi(birthMs),
    };
  }, [item, owner]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial);
    setError("");
    setSaving(false);
  }, [initial, open]);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleBirthDateChange = (value) => {
    if (value && !value.isValid()) return;

    const birthMs = value ? value.startOf("day").valueOf() : null;

    // console.log(birthMs, suggestKhoi(birthMs));

    setForm((current) => ({
      ...current,
      birthMs,
      khoi: suggestKhoi(birthMs),
    }));
  };

  const handleClose = () => {
    if (!saving) onClose?.();
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.owner) {
      setError("Owner is required");
      return;
    }
    if (!form.khoi) {
      setError("Khối is required");
      return;
    }

    setSaving(true);
    try {
      const result = await onSubmit?.({
        ...form,
        name: (form.name || "").trim(),
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose?.();
    } catch (submitError) {
      setError(submitError?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const suggestedKhoi = suggestKhoi(form.birthMs);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? "Edit Khóa sinh" : "Add Khóa sinh"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={form.name}
          onChange={setField("name")}
          disabled={saving}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Birth Date"
            format="DD/MM/YYYY"
            value={form.birthMs ? dayjs(form.birthMs) : null}
            onChange={handleBirthDateChange}
            onAccept={handleBirthDateChange}
            slotProps={{
              textField: { margin: "dense", fullWidth: true },
            }}
          />
        </LocalizationProvider>
        <TextField
          select
          margin="dense"
          label="Khối"
          fullWidth
          value={form.khoi}
          onChange={setField("khoi")}
          helperText={
            suggestedKhoi
              ? `Gợi ý khối theo tuổi: ${suggestedKhoi}`
              : "Chưa có gợi ý khối theo tuổi"
          }
          disabled={saving}
        >
          <MenuItem value="">Chọn khối</MenuItem>
          <MenuItem value="K1">K1 · Lớp 1–3 (6–8 tuổi)</MenuItem>
          <MenuItem value="K2">K2 · Lớp 4–6 (9–11 tuổi)</MenuItem>
          <MenuItem value="K3">K3 · Lớp 7–9 (12–15 tuổi)</MenuItem>
          <MenuItem value="K4">K4 · Lớp 10–12 (16–18 tuổi)</MenuItem>
        </TextField>
        {error ? (
          <div style={{ color: "#d32f2f", marginTop: 8, fontSize: 14 }}>
            {error}
          </div>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
