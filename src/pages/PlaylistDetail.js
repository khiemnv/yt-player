import { useParams } from "react-router-dom";
import PlaylistManager from "../components/PlaylistManager";

export default function PlaylistDetail() {
const { id } = useParams();
    return (<PlaylistManager playlistId={id} />);
}