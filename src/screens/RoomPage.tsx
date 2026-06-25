import { useEffect } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";
import { RoomHeader } from "../components/RoomHeader";
import { RoomSidebar } from "../components/RoomSidebar";
import { usePlayerControls } from "../hooks/usePlayerControls";
import { useSocket } from "../hooks/useSocket";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { getClientId } from "../lib/browserId";
import { extractYouTubeId } from "../lib/youtube";
import { useRoomStore } from "../store/useRoomStore";
import type { ApiResponse, RoomSession } from "../types";
import type { Room } from "../types/socket";
import { PlayerControls } from "../ui/PlayerControls";
import { VideoPlayer } from "../ui/VideoPlayer";

type LocationState = Omit<RoomSession, "code">;

export function RoomPage() {
  const { code = "" } = useParams<{ code: string }>();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;

  const {
    initRoom,
    setRoomName,
    setParticipants,
    setSynced,
    videoUrl,
    isHost,
  } = useRoomStore();

  // All hooks must run before any conditional return
  const handleSync = () => {
    setSynced(true);
    toast.info("Synced to host playback.", { duration: 2500 });
    setTimeout(() => setSynced(false), 3000);
  };

  const controls = usePlayerControls({ onSync: handleSync });

  useSocketEvent("user_joined", (payload) => {
    setParticipants(payload.participants);
    toast.success(`${payload.userName ?? "Someone"} joined the room.`, {
      duration: 3000,
    });
  });

  useSocketEvent("user_left", (payload) => {
    setParticipants(payload.participants);
    toast.info(`${payload.userName ?? "Someone"} left the room.`, {
      duration: 3000,
    });
  });

  useEffect(() => {
    if (!locationState) return;
    // initRoom({ code, ...locationState });

    const fetchRoomData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/room?roomCode=${code}`,
          { method: "GET" },
        );
        const data = (await res.json()) as ApiResponse<Room>;
        if (data.success) {
          setParticipants(data.data.participants);
          setRoomName(data.data.roomName);
        }
      } catch {
        toast.error("Failed to load room data.");
      }
    };

    fetchRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: navigating directly to /room/:code without going through create/join
  if (!locationState) {
    return <Navigate to="/" replace />;
  }

  const effectiveVideoUrl = videoUrl || locationState.videoUrl;
  const videoId = extractYouTubeId(effectiveVideoUrl) ?? undefined;

  const handleLeave = () => {
    socket.current?.emit(
      "leave_room",
      { roomCode: code, userId: getClientId() },
      (res) => {
        if (res.success) {
          toast.success("You left the room.");
        } else {
          toast.error(res.error ?? "Failed to leave room.");
        }
        navigate("/", { replace: true });
      },
    );
  };

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden">
      <RoomHeader onLeave={handleLeave} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden min-w-0">
          <VideoPlayer
            videoId={videoId}
            isHost={isHost}
            onReady={controls.handlePlayerReady}
            onStateChange={controls.handleStateChange}
            className="flex-1 min-h-0"
          />
          <PlayerControls
            isHost={isHost}
            controls={controls}
            className="shrink-0"
          />
        </main>

        <RoomSidebar />
      </div>
    </div>
  );
}
