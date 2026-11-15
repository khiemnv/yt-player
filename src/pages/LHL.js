import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ChamDiemDialog from "../components/LHL/ChamDiemDialog";
import KhoaSinhFormDialog from "../components/LHL/KhoaSinhFormDialog";
import KhoaSinhScoreCard from "../components/LHL/KhoaSinhScoreCard";
import {
  lhlAddKhoaSinh,
  lhlDeleteKhoaSinh,
  lhlLoadAll,
  lhlSaveChamDiemMaskByDay,
  lhlUpdateKhoaSinh,
  selectLhlDsKs,
  selectLhlError,
  selectLhlLoading,
} from "../features/lhl/lhlSlice";
import { selectUsername } from "../features/auth/authSlice";
import {
  lhlGetConfig,
  lhlKsCreate,
  lhlKsDelete,
  lhlKsUpdate,
} from "../services/lhl/lhlApi";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function getDay1Utc0Ms(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function getConfigForKhoi(config, khoi) {
  const groupTagPattern = /\s*\{([^{}]+)\}\s*$/;
  return config.reduce((filtered, item) => {
    if (item.no === 0) {
      filtered.push(item);
      return filtered;
    }

    const groupTag = item.content.match(groupTagPattern);
    if (
      groupTag &&
      (!khoi ||
        !groupTag[1]
          .split(",")
          .map((group) => group.trim().toUpperCase())
          .includes(khoi.toUpperCase()))
    ) {
      return filtered;
    }

    filtered.push({
      ...item,
      content: item.content.replace(groupTagPattern, "").trim(),
    });
    return filtered;
  }, []);
}

export default function LHL() {
  const dispatch = useAppDispatch();
  const owner = useAppSelector(selectUsername);
  const group = process.env.REACT_APP_GRP;
  const dsKhoaSinh = useAppSelector(selectLhlDsKs);
  const loading = useAppSelector(selectLhlLoading);
  const error = useAppSelector(selectLhlError);

  const [day1Utc0Ms, setDay1Utc0Ms] = useState(getDay1Utc0Ms);
  const [chamDiemConfig, setChamDiemConfig] = useState([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [khoaSinhDialog, setKhoaSinhDialog] = useState({
    open: false,
    mode: "create",
    item: null,
  });
  const [scoreDialog, setScoreDialog] = useState({
    open: false,
    day: null,
    khoaSinhId: null,
    khoi: null,
  });
  const [deleteKhoaSinhDialog, setDeleteKhoaSinhDialog] = useState({
    open: false,
    item: null,
  });
  const [deletingKhoaSinh, setDeletingKhoaSinh] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    if (!group || !owner) return;
    dispatch(lhlLoadAll({ group, owner, day1Utc0Ms }));
  }, [dispatch, group, owner, day1Utc0Ms]);

  useEffect(() => {
    if (!group || !owner) return;

    let cancelled = false;
    const loadConfig = async () => {
      setConfigLoading(true);
      setConfigError("");
      try {
        const result = await lhlGetConfig();
        if (cancelled) return;
        if (result?.error) {
          setConfigError(result.error);
        } else {
          setChamDiemConfig(result.result);
        }
      } catch (loadError) {
        if (cancelled) return;
        console.error("Failed to load LHL config:", loadError);
        setConfigError(loadError?.message || "Failed to load LHL config");
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    };

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [group, owner]);

  const closeKhoaSinhDialog = () =>
    setKhoaSinhDialog((current) => ({ ...current, open: false }));

  const submitKhoaSinh = async (payload) => {
    if (khoaSinhDialog.mode === "create") {
      const result = await lhlKsCreate(group, payload);
      if (!result?.error) dispatch(lhlAddKhoaSinh(result.result));
      else {
        setSnackbar({ open: true, severity: "error", message: result.error });
      }
      return result;
    }

    const result = await lhlKsUpdate(
      group,
      khoaSinhDialog.item.id,
      payload,
    );
    if (!result?.error) {
      dispatch(
        lhlUpdateKhoaSinh({
          id: khoaSinhDialog.item.id,
          changes: payload,
        }),
      );
    } else {
      setSnackbar({ open: true, severity: "error", message: result.error });
    }
    return result;
  };

  const deleteKhoaSinh = async (id) => {
    try {
      const result = await lhlKsDelete(group, id, owner);
      if (result?.error) {
        setSnackbar({ open: true, severity: "error", message: result.error });
        return false;
      }
      dispatch(lhlDeleteKhoaSinh(id));
      return true;
    } catch (deleteError) {
      console.error("Failed to delete LHL khoa sinh:", deleteError);
      setSnackbar({
        open: true,
        severity: "error",
        message: deleteError?.message || "Delete failed",
      });
      return false;
    }
  };

  const requestDeleteKhoaSinh = (id) => {
    const item = dsKhoaSinh.find((khoaSinh) => khoaSinh.id === id);
    if (item) setDeleteKhoaSinhDialog({ open: true, item });
  };

  const closeDeleteKhoaSinhDialog = () => {
    if (!deletingKhoaSinh) {
      setDeleteKhoaSinhDialog({ open: false, item: null });
    }
  };

  const confirmDeleteKhoaSinh = async () => {
    const item = deleteKhoaSinhDialog.item;
    if (!item || deletingKhoaSinh) return;

    setDeletingKhoaSinh(true);
    const deleted = await deleteKhoaSinh(item.id);
    setDeletingKhoaSinh(false);
    if (deleted) setDeleteKhoaSinhDialog({ open: false, item: null });
  };

  const closeScoreDialog = () =>
    setScoreDialog({ open: false, day: null, khoaSinhId: null, khoi: null });

  const saveScore = ({ khoaSinhId, day, dayMask }) => {
    dispatch(
      lhlSaveChamDiemMaskByDay({
        group,
        owner,
        day1Utc0Ms,
        khoaSinhId,
        day,
        dayMask,
      }),
    )
      .unwrap()
      .then(closeScoreDialog)
      .catch((saveError) =>
        setSnackbar({
          open: true,
          severity: "error",
          message: saveError?.error || saveError?.message || "Save failed",
        }),
      );
  };

  if (!group) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Set REACT_APP_GRP to the Firestore group used by the LHL page.
        </Alert>
      </Container>
    );
  }
  if (!owner) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">A signed-in user is required.</Alert>
      </Container>
    );
  }
  if (loading || configLoading) return <div>Loading...</div>;
  if (error) return <Alert severity="error">{String(error)}</Alert>;
  if (configError) return <Alert severity="error">{configError}</Alert>;

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            Chấm điểm
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              setKhoaSinhDialog({ open: true, mode: "create", item: null })
            }
          >
            Add
          </Button>
        </Stack>
        {/* <Typography variant="body1" color="text.secondary" mb={3}>
          Thêm, chỉnh sửa và theo dõi điểm trên lịch tháng.
        </Typography> */}
        <Box mb={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Chọn tháng"
                value={dayjs(day1Utc0Ms)}
                views={["year", "month"]}
                openTo="month"
                onChange={(month) => {
                  if (month) {
                    setDay1Utc0Ms(Date.UTC(month.year(), month.month(), 1));
                  }
                }}
                slotProps={{
                  textField: { size: "small", sx: { minWidth: 180 } },
                }}
              />
            </LocalizationProvider>
        </Box>
        {dsKhoaSinh.length === 0 ? (
          <Paper variant="outlined" sx={{ textAlign: "center", p: 2 }}>
            <Typography color="text.secondary">
              Chưa có khóa sinh nào. Hãy thêm thông tin ở trên.
            </Typography>
          </Paper>
        ) : (
          <Grid container sx={{ justifyContent: "center" }}>
            {dsKhoaSinh.map((ks) => (
              <KhoaSinhScoreCard
                key={ks.id}
                ks={ks}
                config={getConfigForKhoi(chamDiemConfig, ks.khoi)}
                currentMonth={dayjs(day1Utc0Ms)}
                setCurrentMonth={(month) => {
                  if (month) {
                    setDay1Utc0Ms(Date.UTC(month.year(), month.month(), 1));
                  }
                }}
                onEdit={() =>
                  setKhoaSinhDialog({ open: true, mode: "edit", item: ks })
                }
                onDelete={requestDeleteKhoaSinh}
                onOpenDate={({ day }) =>
                  setScoreDialog({
                    open: true,
                    khoaSinhId: ks.id,
                    day,
                    khoi: ks.khoi,
                  })
                }
              />
            ))}
          </Grid>
        )}
      </Container>

      <KhoaSinhFormDialog
        open={khoaSinhDialog.open}
        mode={khoaSinhDialog.mode}
        owner={owner}
        item={khoaSinhDialog.item}
        onClose={closeKhoaSinhDialog}
        onSubmit={submitKhoaSinh}
      />
      <Dialog
        open={deleteKhoaSinhDialog.open}
        onClose={closeDeleteKhoaSinhDialog}
      >
        <DialogTitle>Xóa khóa sinh?</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa{" "}
            {deleteKhoaSinhDialog.item?.name || "khóa sinh này"} không?
            {" "}Các bài tập của khóa sinh này cũng sẽ bị xóa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteKhoaSinhDialog} disabled={deletingKhoaSinh}>
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteKhoaSinh}
            disabled={deletingKhoaSinh}
          >
            {deletingKhoaSinh ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
      <ChamDiemDialog
        open={scoreDialog.open}
        day={scoreDialog.day}
        khoaSinhId={scoreDialog.khoaSinhId}
        config={getConfigForKhoi(chamDiemConfig, scoreDialog.khoi)}
        onClose={closeScoreDialog}
        onSave={saveScore}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
