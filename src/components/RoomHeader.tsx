import { useRoomStore } from "../store/useRoomStore";
import { RoomCode } from "../ui/RoomCode";
import { Button } from "../ui/Button";
import { IconLogOut, IconSignal } from "../ui/icons";

function SyncedIndicator() {
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium animate-pulse">
      <IconSignal />
      <span>All synced</span>
    </div>
  );
}

interface RoomHeaderProps {
  onLeave: () => void;
}

export function RoomHeader({ onLeave }: Readonly<RoomHeaderProps>) {
  const { code, roomName, synced } = useRoomStore();

  return (
    <header className="flex items-center gap-4 px-5 py-3 border-b border-border bg-canvas shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center shadow-[0_0_10px_rgba(240,160,32,0.35)]">
          <svg
            className="w-3.5 h-3.5 text-canvas ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="font-display font-bold text-fg text-sm tracking-tight hidden sm:block">
          SyncRoom
        </span>
      </div>

      <div className="w-px h-5 bg-border shrink-0" />

      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-fg text-sm truncate">
          {roomName}
        </h1>
      </div>

      {synced && <SyncedIndicator />}

      <RoomCode code={code} />

      <Button
        variant="ghost"
        size="sm"
        icon={<IconLogOut />}
        onClick={onLeave}
        className="text-fg-subtle hover:text-danger shrink-0"
      >
        <span className="hidden sm:block">Leave</span>
      </Button>
    </header>
  );
}
