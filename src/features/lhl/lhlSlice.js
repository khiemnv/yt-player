import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  lhlBtCreate,
  lhlBtGetAllByMonth,
  lhlBtUpdate,
  lhlKsGetAll,
} from "../../services/lhl/lhlApi";

export const lhlLoadAll = createAsyncThunk(
  "lhl/loadAll",
  async ({ group, owner, day1Utc0Ms }, thunkAPI) => {
    const [ksRes, btRes] = await Promise.all([
      lhlKsGetAll(group, owner),
      lhlBtGetAllByMonth(group, owner, day1Utc0Ms),
    ]);

    if (ksRes?.error) return thunkAPI.rejectWithValue({ error: ksRes.error });
    if (btRes?.error) return thunkAPI.rejectWithValue({ error: btRes.error });

    return {
      khoasinh: ksRes.result || [],
      baitap: btRes.result || [],
      day1Utc0Ms,
      owner,
      group,
    };
  },
);

export const lhlLoadBaiTapByMonth = createAsyncThunk(
  "lhl/loadBaiTapByMonth",
  async ({ group, owner, day1Utc0Ms }, thunkAPI) => {
    const res = await lhlBtGetAllByMonth(group, owner, day1Utc0Ms);
    if (res?.error) return thunkAPI.rejectWithValue({ error: res.error });

    return { group, owner, day1Utc0Ms, baitap: res.result || [] };
  },
);

const sliceLhl = createSlice({
  name: "lhl",
  initialState: {
    group: "",
    owner: "",
    day1Utc0Ms: 0,
    dsKhoaSinh: [],
    dsBaiTap: [],
    loading: false,
    error: null,
    lastLoadedAt: 0,
    loadingKs: false,
    loadingBt: false,
    errorKs: null,
    errorBt: null,
  },
  reducers: {
    lhlSetContext(state, action) {
      const { group, owner, day1Utc0Ms } = action.payload || {};
      if (group !== undefined) state.group = group;
      if (owner !== undefined) state.owner = owner;
      if (day1Utc0Ms !== undefined) state.day1Utc0Ms = day1Utc0Ms;
    },
    lhlClear(state) {
      state.dsKhoaSinh = [];
      state.dsBaiTap = [];
      state.loading = false;
      state.error = null;
      state.lastLoadedAt = 0;
    },
    lhlAddKhoaSinh(state, action) {
      state.dsKhoaSinh.push(action.payload);
    },
    lhlUpdateKhoaSinh(state, action) {
      const { id, changes } = action.payload;
      const index = state.dsKhoaSinh.findIndex((ks) => ks.id === id);
      if (index !== -1) {
        state.dsKhoaSinh[index] = { ...state.dsKhoaSinh[index], ...changes };
      }
    },
    lhlDeleteKhoaSinh(state, action) {
      state.dsKhoaSinh = state.dsKhoaSinh.filter(
        (ks) => ks.id !== action.payload,
      );
      state.dsBaiTap = state.dsBaiTap.filter(
        (baiTap) => baiTap.khoaSinhId !== action.payload,
      );
    },
    lhlBtUpsertMonthByKs(state, action) {
      const item = action.payload;
      const index = state.dsBaiTap.findIndex(
        (x) =>
          x.owner === item.owner &&
          x.khoaSinhId === item.khoaSinhId &&
          x.day1Utc0Ms === item.day1Utc0Ms,
      );
      if (index >= 0) {
        state.dsBaiTap[index] = { ...state.dsBaiTap[index], ...item };
      } else {
        state.dsBaiTap.unshift(item);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(lhlLoadAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lhlLoadAll.fulfilled, (state, action) => {
        const { khoasinh, baitap, day1Utc0Ms, owner, group } = action.payload;
        state.group = group;
        state.owner = owner;
        state.day1Utc0Ms = day1Utc0Ms;
        state.dsKhoaSinh = khoasinh;
        state.dsBaiTap = baitap;
        state.loading = false;
        state.error = null;
        state.lastLoadedAt = Date.now();
      })
      .addCase(lhlLoadAll.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || action.error?.message || "load failed";
      })
      .addCase(lhlLoadBaiTapByMonth.pending, (state) => {
        state.loadingBt = true;
        state.errorBt = null;
      })
      .addCase(lhlLoadBaiTapByMonth.fulfilled, (state, action) => {
        const { group, owner, day1Utc0Ms, baitap } = action.payload;
        state.group = group;
        state.owner = owner;
        state.day1Utc0Ms = day1Utc0Ms;
        state.dsBaiTap = baitap;
        state.loadingBt = false;
        state.errorBt = null;
      })
      .addCase(lhlLoadBaiTapByMonth.rejected, (state, action) => {
        state.loadingBt = false;
        state.errorBt =
          action.payload?.error ||
          action.error?.message ||
          "load baitap failed";
      });
  },
});

export const {
  lhlSetContext,
  lhlClear,
  lhlAddKhoaSinh,
  lhlUpdateKhoaSinh,
  lhlDeleteKhoaSinh,
  lhlBtUpsertMonthByKs,
} = sliceLhl.actions;

export default sliceLhl.reducer;

export const selectLhl = (state) => state.lhl;
export const selectLhlDsKs = (state) => state.lhl.dsKhoaSinh;
export const selectLhlDsBt = (state) => state.lhl.dsBaiTap;
export const selectLhlLoading = (state) => state.lhl.loading;
export const selectLhlError = (state) => state.lhl.error;

function daysInMonthFromDay1Utc0Ms(day1Utc0Ms) {
  const date = new Date(day1Utc0Ms);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

function emptyMasks(daysInMonth) {
  return Array.from({ length: daysInMonth }, () => 0);
}

export const lhlSaveChamDiemMaskByDay = createAsyncThunk(
  "lhl/saveChamDiemMaskByDay",
  async (
    { day, dayMask, day1Utc0Ms, group, owner, khoaSinhId },
    thunkAPI,
  ) => {
    const state = thunkAPI.getState();
    const list = state.lhl.dsBaiTap || [];
    const existing = list.find(
      (item) =>
        item.khoaSinhId === khoaSinhId &&
        item.day1Utc0Ms === day1Utc0Ms,
    );

    const daysInMonth = daysInMonthFromDay1Utc0Ms(day1Utc0Ms);
    const index = day - 1;
    if (index < 0 || index >= daysInMonth) {
      return thunkAPI.rejectWithValue({ error: "Invalid day for this month" });
    }

    const baseMasks =
      existing?.masks?.length === daysInMonth
        ? existing.masks
        : emptyMasks(daysInMonth);
    const masks = [...baseMasks];
    masks[index] = dayMask ?? 0;

    const result = existing?.id
      ? await lhlBtUpdate(group, existing.id, { masks })
      : await lhlBtCreate(group, {
          owner,
          khoaSinhId,
          day1Utc0Ms,
          masks,
        });

    if (result?.error) {
      return thunkAPI.rejectWithValue({ error: result.error });
    }

    const id = result.result?.id || existing?.id;
    thunkAPI.dispatch(
      lhlBtUpsertMonthByKs({
        ...existing,
        id,
        owner,
        khoaSinhId,
        day1Utc0Ms,
        masks,
      }),
    );

    return { ...result.result, id, owner, khoaSinhId, day1Utc0Ms, masks };
  },
);
