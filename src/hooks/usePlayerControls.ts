import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { DEFAULT_VOLUME, SYNC_FLASH_MS } from "../constants";
import { useRoomStore } from "../store/useRoomStore";
import { useSocket } from "./useSocket";
import { useSocketEvent } from "./useSocketEvent";

interface UsePlayerControlsOptions {
  onSync?: () => void;
}

export function usePlayerControls({ onSync }: UsePlayerControlsOptions = {}) {
  const { socket, isConnected } = useSocket();

  const {
    code,
    playing,
    setPlaying,
    currentTime,
    setCurrentTime: storeSetCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    muted,
    setMuted,
    speed,
    setSpeed,
  } = useRoomStore();

  const playerRef = useRef<YouTubePlayer | null>(null);

  // Transient UI-only state — not worth sharing globally
  const [showSpeed, setShowSpeed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const seekAndEmit = (t: number) => {
    storeSetCurrentTime(t);
    playerRef.current?.seekTo(t, true);
    if (isConnected) {
      socket.current?.emit("video_seek", { roomCode: code, timestamp: t });
    }
  };

  useSocketEvent("video_seeked", (payload) => {
    storeSetCurrentTime(payload.timestamp);
    playerRef.current?.seekTo(payload.timestamp, true);
  });

  useSocketEvent("video_played", (payload) => {
    setPlaying(true);
    playerRef.current?.playVideo();
    playerRef.current?.seekTo(payload.timestamp, true);
  });

  useSocketEvent("video_paused", (payload) => {
    setPlaying(false);
    playerRef.current?.pauseVideo();
    storeSetCurrentTime(payload.timestamp);
  });

  // Poll current time every 500ms while playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      storeSetCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
    }, 500);
    return () => clearInterval(id);
  }, [playing, storeSetCurrentTime]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const effectiveVolume = muted ? 0 : volume;

  const handlePlayerReady = (player: YouTubePlayer) => {
    playerRef.current = player;
    const d = player.getDuration();
    if (d > 0) setDuration(d);
    player.setVolume(DEFAULT_VOLUME);
  };

  // YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
  const handleStateChange = (state: number) => {
    const isPlaying = state === 1;
    setPlaying(isPlaying);
    if (state === 1 || state === 2) {
      storeSetCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
    }
    if (state === 1 && duration === 0) {
      setDuration(playerRef.current?.getDuration() ?? 0);
    }
  };

  const togglePlay = () => {
    if (playing) {
      playerRef.current?.pauseVideo();
      if (isConnected) {
        socket.current?.emit("video_pause", {
          roomCode: code,
          timestamp: playerRef.current?.getCurrentTime(),
        });
      }
    } else {
      playerRef.current?.playVideo();
      if (isConnected) {
        socket.current?.emit("video_play", {
          roomCode: code,
          timestamp: playerRef.current?.getCurrentTime(),
        });
      }
    }
  };

  const toggleMute = () => {
    if (muted) {
      playerRef.current?.unMute();
      setMuted(false);
    } else {
      playerRef.current?.mute();
      setMuted(true);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setMuted(false);
    playerRef.current?.unMute();
    playerRef.current?.setVolume(v);
  };

  const handleSpeedSelect = (s: number) => {
    setSpeed(s);
    setShowSpeed(false);
    playerRef.current?.setPlaybackRate(s);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), SYNC_FLASH_MS);
    onSync?.();
  };

  return {
    // State
    playing,
    currentTime,
    duration,
    volume,
    muted,
    effectiveVolume,
    speed,
    showSpeed,
    setShowSpeed,
    syncing,
    progress,
    // Controls
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSpeedSelect,
    handleSync,
    setCurrentTime: seekAndEmit,
    // YouTube event callbacks
    handlePlayerReady,
    handleStateChange,
  };
}
