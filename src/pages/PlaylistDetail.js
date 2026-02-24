import { useParams } from "react-router-dom";
import PlaylistManager from "../components/PlaylistManager";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { addPlaylist, makeSelectPlaylistById } from "../features/video/videoSlice";
import { useSelector } from "react-redux";
import { getPlaylist } from "../services/search/videoApi";

export default function PlaylistDetail() {

    const { id } = useParams();
    const dispatch = useAppDispatch();
    const selectPlaylist = useMemo(makeSelectPlaylistById, []);
    const currentPlaylist = useSelector(state =>
        selectPlaylist(state, id)
    );
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        async function loadPl() {
            if (currentPlaylist) return;            
            if (!id) return;
            
            setLoading(true);
            const { result } = await getPlaylist(id);
            if (result) {
                dispatch(addPlaylist({ playlist: result }))
            }
            setLoading(false);
        }
        loadPl();
    }, [currentPlaylist, dispatch, id]);


    if (loading) {
        return <>loading…</>;
    }

    return (<PlaylistManager playlistId={id} />);
}