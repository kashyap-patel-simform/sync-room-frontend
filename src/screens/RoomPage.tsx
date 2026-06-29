import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { RoomHeader } from "../components/RoomHeader";
import { RoomSidebar } from "../components/RoomSidebar";
import { usePlayerControls } from "../hooks/usePlayerControls";
import { useSocket } from "../hooks/useSocket";
import { useSocketEvent } from "../hooks/useSocketEvent";
import { getClientId } from "../lib/client-id";
import { extractYouTubeId } from "../lib/youtube";
import { useRoomStore } from "../store/useRoomStore";
import type { ApiResponse } from "../types";
import type { Room } from "../types/socket";
import { PlayerControls } from "../ui/PlayerControls";
import { VideoPlayer } from "../ui/VideoPlayer";

export function RoomPage() {
  const { code = "" } = useParams<{ code: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const {
    initRoom,
    setParticipants,
    setSynced,
    videoUrl,
    isHost,
    roomName,
    clearRoom,
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
    const fetchRoomData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/room?roomCode=${code}`,
          { method: "GET" },
        );
        const data = (await res.json()) as ApiResponse<Room>;
        if (data.success && data.data) {
          initRoom({
            ...data.data,
            userId: getClientId(),
            userName: localStorage.getItem("user_name") ?? "Unknown",
            isHost: data.data.hostId === getClientId(),
          });
        }
      } catch {
        toast.error("Failed to load room data.");
      }
    };

    if (roomName === "") fetchRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveVideoUrl = videoUrl;
  const videoId = extractYouTubeId(effectiveVideoUrl) ?? undefined;

  const handleLeave = () => {
    socket.current?.emit(
      "leave_room",
      { roomCode: code, userId: getClientId() },
      (res) => {
        if (res.success) {
          toast.success("You left the room.");
          clearRoom();
          localStorage.removeItem("user_name");
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
