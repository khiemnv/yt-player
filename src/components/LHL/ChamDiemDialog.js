import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { selectLhlDsBt } from "../../features/lhl/lhlSlice";
import { maskHas, maskToggle } from "../../services/lhl/lhlApi";

export default function ChamDiemDialog({
  open,
  khoaSinhId,
  day,
  config = [],
  onClose,
  onSave,
}) {
  const baiTap = useAppSelector(selectLhlDsBt);
  const [mask, setMask] = useState(0);

  useEffect(() => {
    const monthRecord = baiTap.find((item) => item.khoaSinhId === khoaSinhId);
    if (!monthRecord || !day || day < 1 || day > monthRecord.masks.length) {
      setMask(0);
      return;
    }
    setMask(monthRecord.masks[day - 1] ?? 0);
  }, [open, day, baiTap, khoaSinhId]);

  const handleChange = (no) => (event) => {
    setMask((current) => maskToggle(current, no, event.target.checked));
  };

  //• Khối 1: Từ lớp 1 đến lớp 3
// • Khối 2: Từ lớp 4 đến lớp 6 
//   • Khối 3: Từ lớp 7 đến lớp 9 (khoảng 12 - 15 tuổi)
// • Khối 4: Từ lớp 10 đến lớp 12 (khoảng 16 - 18 tuổi))
  // loc cac bai tap theo khoi "content {K1,K2}"
  const selfDiscipline = config.find((item) => item.no === 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chấm điểm ngày {day}</DialogTitle>
      <DialogContent>
        {selfDiscipline && (
          <FormControlLabel
            control={
              <Switch
                checked={maskHas(mask, selfDiscipline.no)}
                onChange={handleChange(selfDiscipline.no)}
              />
            }
            label={
              maskHas(mask, selfDiscipline.no)
                ? "Tự giác"
                : "Không tự giác"
            }
          />
        )}
        <FormGroup>
          {config
            .filter((item) => item.no !== 0)
            .map((item) => (
              <FormControlLabel
                key={item.no}
                control={
                  <Checkbox
                    checked={maskHas(mask, item.no)}
                    onChange={handleChange(item.no)}
                  />
                }
                label={`${item.no}. ${item.content}`}
              />
            ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave?.({ khoaSinhId, day, dayMask: mask })}
          disabled={!day}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
