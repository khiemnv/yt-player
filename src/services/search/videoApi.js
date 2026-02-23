import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  addDoc,
  getDoc,
  Timestamp,
  writeBatch,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BaseApi, cloneObj } from "../user/userApi";
/**
 * CURD
 */

class PlaylistApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      title: "",
      dateCreated: null,
      owner: "",
      note: "",
    };
    super("playlists", defaultEntity);
  }

  async fetchNextPage(collectionName,
  pageSize = 100,
  lastDoc = null,
  tag = null,) {
    const q = lastDoc
      ? query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      )
      : query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        limit(pageSize)
      );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // records.forEach((u) => this.map.set(u.id, cloneObj(u)));

    const nextCursor =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    var result = {
      records,
      nextCursor,
      hasMore: snapshot.size === pageSize,
    };
    return { result };
  }

  async getAll(uid) {
    const q = query(
      collection(db, "playlists"),
      where("owner", "==", uid),
      // orderBy("dateCreated", "desc")
    );
    const snapshot = await getDocs(q);
    const playlists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated?.toDate().toISOString(),
    }));
    return {result: playlists}; 
  }
  
  async createPlaylist(uid, playlist) {
    const newPlaylist = {
      ...playlist,
      owner: uid,
      dateCreated: Timestamp.fromDate(new Date(playlist.dateCreated)),
    };
    const {result, error} = await this.create(newPlaylist);
    if (result) {
      result.dateCreated = result.dateCreated.toDate().toISOString();
    }
    return {result, error};
  }

  async updatePlaylist(id, changes) {
    const updatedFields = { ...changes }; 
    if (changes.dateCreated) {
      updatedFields.dateCreated = Timestamp.fromDate(new Date(changes.dateCreated));
    }
    const {result, error} = await this.update(id, updatedFields);
    return {result, error};
  }
}
var playlistApi = new PlaylistApi();

function playlistWrapMethod(originalMethod, idx) {
  return async function () {
    // Call the original method
    var { error, result } = await originalMethod.apply(this, arguments);
    if (!error) {
      if (Array.isArray(result)) {
        result.forEach(function (p) {
          p.dateCreated = Timestamp.toDate(p.dateCreated);;
        });
      } else {
        result.dateCreated = result.dateCreated.toDate().toISOString();
      }
    }
    return { error, result };
  };
}

export const getAllPlaylists = (uid) => playlistApi.getAll(uid);
export const createPlaylist = (uid, playlist) => playlistApi.createPlaylist(uid, playlist);
export const updatePlaylist = (id, changes) => playlistApi.updatePlaylist(id, changes);
export const removePlaylist = (id) => playlistApi.remove(id);

class TagApi extends BaseApi {
  constructor() {
    const defaultEntity = { tag: "" };
    super("tags", defaultEntity);
  } 
}
var tagApi = new TagApi();
export const getAllTags = () => tagApi.getAll();
export const createTag = (tag, token) => tagApi.create(tag);
export const updateTag = (id, changes, token) => tagApi.update(id, changes);
export const saveTag = (tag, token) => tagApi.save(tag);  
export const removeTag = (id, token) => tagApi.remove(id);
export const saveOrCreateTag = (tag, token) => tagApi.saveOrCreate(tag);
