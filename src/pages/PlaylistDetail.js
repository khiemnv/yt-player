import { useNavigate, useParams } from "react-router-dom";
import PlaylistManager from "../components/PlaylistManager";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { addPlaylist, makeSelectPlaylistById } from "../features/video/videoSlice";
import { useSelector } from "react-redux";
import { getPlaylist } from "../services/search/videoApi";

export default function PlaylistDetail() {
    console.log("PlaylistDetail")
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const selectPlaylist = useMemo(makeSelectPlaylistById, []);
    const currentPlaylist = useSelector(state =>
        selectPlaylist(state, id)
    );
    // const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadPl() {
            if (currentPlaylist) return;

            try {
                if (!id) {
                    throw new Error("Require Id")
                }

                const { result } = await getPlaylist(id);
                if (result) {
                    dispatch(addPlaylist({ playlist: result }))
                }
                else {
                    throw new Error("Playlist not found")
                }
            } catch (ex) {
                console.error(ex.message);
                navigate(`/`);
            }

            // setLoading(false);
        }
        loadPl();
    }, [currentPlaylist, dispatch, id, navigate]);

    if (!currentPlaylist) {
        return <>loading…</>;
    }

    return (<PlaylistManager playlistId={id} />);
}