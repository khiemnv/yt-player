import React, { useMemo } from "react";
import dayjs from "dayjs";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAppSelector } from "../../app/hooks";
import { selectLhlDsBt } from "../../features/lhl/lhlSlice";
import { maskHas, nosFromMask } from "../../services/lhl/lhlApi";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthDays(month) {
  const start = month.startOf("month");
  return [
    ...Array(start.day()).fill(null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => index + 1),
  ];
}

function getDailyScore(mask) {
  const taskCount = nosFromMask(mask).filter((no) => no !== 0).length;
  return maskHas(mask, 0) ? taskCount : taskCount / 2;
}

export default function KhoaSinhScoreCard({
  ks,
  currentMonth,
  setCurrentMonth,
  config = [],
  onEdit,
  onDelete,
  onOpenDate,
}) {
  const dsBaiTap = useAppSelector(selectLhlDsBt);
  const today = dayjs();
  const days = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const isCurrentMonth = currentMonth.isSame(today, "month");
  const monthRecord = dsBaiTap.find((item) => item.khoaSinhId === ks.id);
  const monthTotal = useMemo(
    () =>
      (monthRecord?.masks || []).reduce(
        (total, mask) => total + getDailyScore(mask),
        0,
      ),
    [monthRecord],
  );

  const tasks = config.filter((item) => item.no !== 0);
  const getDailyMask = (day) => monthRecord?.masks?.[day - 1] ?? 0;

  return (
    <Grid
      sx={{
        minWidth: { xs: "100%", md: 300 },
        maxWidth: { md: "50%", sm: "100%" },
        flexGrow: 1,
        p: 1,
      }}
    >
      <Card elevation={3}>
        <CardHeader
          title={ks.note || ks.name || ks.id}
          subheader={
            <span>
              Tổng điểm: <strong>{monthTotal}</strong>
            </span>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <IconButton color="primary" onClick={() => onEdit?.(ks)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => onDelete?.(ks.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          }
          
        />
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >

          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              textAlign: "center",
            }}
          >
            {WEEKDAYS.map((weekday) => (
              <Typography
                key={weekday}
                variant="caption"
                fontWeight={700}
                color="text.secondary"
              >
                {weekday}
              </Typography>
            ))}
            {days.map((day, index) =>
              day === null ? (
                <Box key={`blank-${index}`} sx={{ height: 60 }} />
              ) : (
                <Box
                  key={day}
                  component="button"
                  type="button"
                  onClick={() => onOpenDate?.({ ks, day })}
                  sx={{
                    width: "100%",
                    minHeight: 60,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    border: "none",
                    cursor: "pointer",
                    bgcolor:
                      isCurrentMonth && day === today.date()
                        ? "primary.main"
                        : "transparent",
                    color:
                      isCurrentMonth && day === today.date()
                        ? "white"
                        : "text.primary",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor:
                        isCurrentMonth && day === today.date()
                          ? "primary.dark"
                          : "grey.200",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontWeight:
                        isCurrentMonth && day === today.date() ? 700 : 400,
                      fontSize: 16,
                    }}
                  >
                    {day}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      width: 52,
                      lineHeight: 1,
                    }}
                  >
                    {tasks.map(({ no }) => {
                      const mask = getDailyMask(day);
                      const checked = maskHas(mask, no);
                      const Star = !checked
                        ? StarBorderIcon
                        : maskHas(mask, 0)
                          ? StarIcon
                          : StarHalfIcon;
                      return (
                        <Star
                          key={no}
                          sx={{
                            fontSize: 12,
                            color: checked ? "#FFD700" : "text.disabled",
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ),
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
