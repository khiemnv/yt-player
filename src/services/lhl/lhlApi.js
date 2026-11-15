import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { handleApiError, snapshotToArray } from "../../utils/fbUtil";

function getCollection(group, name) {
  return collection(db, "lhl", group, name);
}

async function getLhlConfig() {
  try {
    const configDoc = await getDoc(doc(db, "lhl", "config"));
    if (!configDoc.exists()) {
      throw new Error("LHL config document not found");
    }

    // [1. bai tap ...]
    const dsBaiTap = configDoc.data().dsBaiTap;
    if (!Array.isArray(dsBaiTap) || dsBaiTap.length === 0) {
      throw new Error("LHL config dsBaiTap must be a non-empty array");
    }

    const result = dsBaiTap.map((item) => {
      const match =
        typeof item === "string" && item.match(/^(\d+)\.\s+(.+)$/);
      if (!match || !match[2].trim()) {
        throw new Error('Invalid LHL config item; expected a string like "1. Dậy sớm"');
      }

      return {
        no: Number(match[1]),
        content: match[2].trim(),
      };
    });
    return { result };
  } catch (error) {
    return handleApiError("lhl.config.get", error);
  }
}

function normalizeKhoaSinh(item) {
  if (item.birth?.toMillis) {
    item.birthMs = item.birth.toMillis();
    delete item.birth;
  }
  return item;
}

function normalizeBaiTap(item) {
  if (item.createdAt?.toMillis) {
    item.day1Utc0Ms = item.createdAt.toMillis();
    delete item.createdAt;
  }
  return item;
}

function toKhoaSinhFirestore(item) {
  const { birthMs, ...body } = item;
  if (typeof birthMs === "number") {
    body.birth = Timestamp.fromMillis(birthMs);
  } else if (birthMs === null) {
    body.birth = null;
  }
  return body;
}

function toBaiTapFirestore(item) {
  const { day1Utc0Ms, ...body } = item;
  if (typeof day1Utc0Ms === "number") {
    body.createdAt = Timestamp.fromMillis(day1Utc0Ms);
  }
  return body;
}

async function getAllKhoaSinh(group, owner) {
  try {
    const result = await getDocs(
      query(getCollection(group, "khoasinh"), where("owner", "==", owner)),
    );
    return { result: snapshotToArray(result).map(normalizeKhoaSinh) };
  } catch (error) {
    return handleApiError("lhl.khoasinh.getAll", error);
  }
}

async function getAllBaiTapByMonth(group, owner, day1Utc0Ms) {
  try {
    const result = await getDocs(
      query(
        getCollection(group, "baitap"),
        where("owner", "==", owner),
        where("createdAt", "==", Timestamp.fromMillis(day1Utc0Ms)),
      ),
    );
    return { result: snapshotToArray(result).map(normalizeBaiTap) };
  } catch (error) {
    return handleApiError("lhl.baitap.getAllByMonth", error);
  }
}

async function createKhoaSinh(group, params) {
  try {
    const body = {
      birthMs: params.birthMs ?? 0,
      khoi: params.khoi ?? "",
      name: params.name ?? "",
      owner: params.owner ?? "",
    };
    const ref = await addDoc(
      getCollection(group, "khoasinh"),
      toKhoaSinhFirestore(body),
    );
    return { result: { ...body, id: ref.id } };
  } catch (error) {
    return handleApiError("lhl.khoasinh.create", error);
  }
}

async function updateKhoaSinh(group, id, changes) {
  try {
    await updateDoc(
      doc(db, "lhl", group, "khoasinh", id),
      toKhoaSinhFirestore(changes),
    );
    return { result: { id } };
  } catch (error) {
    return handleApiError("lhl.khoasinh.update", error);
  }
}

async function deleteKhoaSinh(group, id, owner) {
  try {
    if (!owner) {
      return handleApiError(
        "lhl.khoasinh.delete",
        new Error("Missing owner"),
      );
    }

    const baiTapSnapshot = await getDocs(
      query(
        getCollection(group, "baitap"),
        where("khoaSinhId", "==", id),
        where("owner", "==", owner),
      ),
    );

    const batchSize = 500;
    for (let i = 0; i < baiTapSnapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      baiTapSnapshot.docs
        .slice(i, i + batchSize)
        .forEach((baiTap) => batch.delete(baiTap.ref));
      await batch.commit();
    }

    await deleteDoc(doc(db, "lhl", group, "khoasinh", id));
    return { result: { id } };
  } catch (error) {
    return handleApiError("lhl.khoasinh.delete", error);
  }
}

async function createBaiTap(group, params) {
  try {
    const body = {
      day1Utc0Ms: params.day1Utc0Ms ?? 0,
      masks: params.masks ?? [],
      khoaSinhId: params.khoaSinhId ?? "",
      owner: params.owner ?? "",
    };
    const ref = await addDoc(
      getCollection(group, "baitap"),
      toBaiTapFirestore(body),
    );
    return { result: { ...body, id: ref.id } };
  } catch (error) {
    return handleApiError("lhl.baitap.create", error);
  }
}

async function updateBaiTap(group, id, changes) {
  try {
    await updateDoc(
      doc(db, "lhl", group, "baitap", id),
      toBaiTapFirestore(changes),
    );
    return { result: { id } };
  } catch (error) {
    return handleApiError("lhl.baitap.update", error);
  }
}

export const lhlKsGetAll = getAllKhoaSinh;
export const lhlGetConfig = getLhlConfig;
export const lhlKsCreate = createKhoaSinh;
export const lhlKsUpdate = updateKhoaSinh;
export const lhlKsDelete = deleteKhoaSinh;
export const lhlBtGetAllByMonth = getAllBaiTapByMonth;
export const lhlBtCreate = createBaiTap;
export const lhlBtUpdate = updateBaiTap;

export function maskHas(mask, no) {
  return ((mask ?? 0) & (1 << no)) !== 0;
}

export function maskToggle(mask, no, checked) {
  const bit = 1 << no;
  const value = mask ?? 0;
  return checked ? value | bit : value & ~bit;
}

export function nosFromMask(mask) {
  const values = [];
  let bit = 0;
  let remaining = mask ?? 0;
  while (remaining !== 0) {
    if (remaining & 1) values.push(bit);
    remaining >>>= 1;
    bit += 1;
  }
  return values;
}

export function countBits(mask) {
  let value = mask ?? 0;
  let count = 0;
  while (value) {
    value &= value - 1;
    count += 1;
  }
  return count;
}
