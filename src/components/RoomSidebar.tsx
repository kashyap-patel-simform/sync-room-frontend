import { extractYouTubeId } from "../lib/youtube";
import { useRoomStore } from "../store/useRoomStore";
import { ParticipantList } from "../ui/ParticipantList";

export function RoomSidebar() {
  const { roomName, videoUrl, role } = useRoomStore();

  const videoId = extractYouTubeId(videoUrl) ?? undefined;
  const isHost = role === "host";

  return (
    <aside className="w-64 border-l border-border bg-page flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle mb-2">
          Now watching
        </p>
        {videoId ? (
          <div className="flex items-start gap-2">
            <div className="w-10 h-7 rounded-md bg-surface-raised overflow-hidden shrink-0">
              <img
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
              {roomName}
            </p>
          </div>
        ) : (
          <p className="text-xs text-fg-subtle italic">No video loaded</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ParticipantList />
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
            isHost
              ? "bg-amber/10 border border-amber/20 text-amber"
              : "bg-teal/10 border border-teal/20 text-teal"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isHost ? "bg-amber" : "bg-teal"}`}
          />
          <span>
            {isHost
              ? "You are the host — you control playback"
              : "Following host's playback"}
          </span>
        </div>
      </div>
    </aside>
  );
}
