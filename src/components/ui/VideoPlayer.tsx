import { cn } from "../../lib/cn";
import { IconPlay } from "../../ui/icons";
interface VideoPlayerProps {
  videoId?: string;
  isHost?: boolean;
  className?: string;
}

function EmptyState() {
  return (
    <div className="relative z-10 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-surface-raised border border-border flex items-center justify-center">
        <IconPlay className="w-7 h-7 text-fg-subtle" />
      </div>
      <p className="text-fg-subtle text-sm">Waiting for host to load a video</p>
    </div>
  );
}

function RoleBadge({ isHost }: { isHost: boolean }) {
  return isHost ? (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber/20 border border-amber/30 text-amber text-xs font-semibold backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
      <span>HOST</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/15 border border-teal/25 text-teal text-xs font-semibold backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
      <span>SYNCED</span>
    </span>
  );
}

export function VideoPlayer({
  videoId,
  isHost = false,
  className,
}: Readonly<VideoPlayerProps>) {
  if (!videoId) {
    return (
      <div
        className={cn(
          "relative aspect-video bg-surface rounded-2xl overflow-hidden flex items-center justify-center border border-border scanlines",
          className,
        )}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video bg-black rounded-2xl overflow-hidden",
        className,
      )}
    >
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=${isHost ? 1 : 0}&modestbranding=1&rel=0&showinfo=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="Collaborative video player"
      />
      {!isHost && (
        <div
          className="absolute inset-0 cursor-not-allowed"
          title="Host controls playback for everyone"
        />
      )}
      <div className="absolute top-3 right-3">
        <RoleBadge isHost={isHost} />
      </div>
    </div>
  );
}
