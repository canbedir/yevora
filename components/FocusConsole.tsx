"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Clock3,
  GitCommitHorizontal,
  Link2,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { refreshTodayQueue } from "@/components/dashboard/useTodayQueue";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const FOCUS_PRESETS = [15, 25, 45, 60];
const STORAGE_KEY = "yevora.focusSettings";
const DEFAULT_FOCUS_SETTINGS = { focusMinutes: 25, breakMinutes: 5 };
type TimerMode = "focus" | "break";

interface StoredFocusSettings {
  focusMinutes: number;
  breakMinutes: number;
}

interface PomodoroSessionData {
  id: string;
  duration: number;
  label?: string | null;
  repositoryName?: string | null;
  repositoryUrl?: string | null;
  commitCount: number;
  outputSummary?: string | null;
  completedAt: string;
}

function readStoredSettings(): StoredFocusSettings {
  if (typeof window === "undefined") {
    return DEFAULT_FOCUS_SETTINGS;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const parsed = storedValue ? (JSON.parse(storedValue) as Partial<StoredFocusSettings>) : null;
    const focusMinutes = normalizeMinutes(parsed?.focusMinutes, 25);
    const breakMinutes = normalizeMinutes(parsed?.breakMinutes, 5);

    return { focusMinutes, breakMinutes };
  } catch {
    return DEFAULT_FOCUS_SETTINGS;
  }
}

function normalizeMinutes(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(180, Math.max(1, Math.round(numberValue)));
}

function normalizeCommitCount(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.min(999, Math.max(0, Math.round(numberValue)));
}

function getLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getTimerTextClassName(totalSeconds: number) {
  const minuteDigits = Math.floor(totalSeconds / 60).toString().length;

  if (minuteDigits >= 3) {
    return "text-[clamp(2.25rem,6.4vw,3.35rem)]";
  }

  return "text-[clamp(2.7rem,6.8vw,3.9rem)]";
}

function playBeep(audioContextRef: { current: AudioContext | null }) {
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, context.currentTime);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
  } catch (error) {
    console.error("Audio playback failed", error);
  }
}

export function FocusConsole() {
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_SETTINGS.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_FOCUS_SETTINGS.breakMinutes);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_SETTINGS.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [taskLabel, setTaskLabel] = useState("");
  const [repositoryName, setRepositoryName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [commitCount, setCommitCount] = useState(0);
  const [outputSummary, setOutputSummary] = useState("");
  const [sessions, setSessions] = useState<PomodoroSessionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAwaitingWrapUp, setIsAwaitingWrapUp] = useState(false);
  const [hasCompletedBreak, setHasCompletedBreak] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasLoadedStoredSettings, setHasLoadedStoredSettings] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeMinutes = timerMode === "focus" ? focusMinutes : breakMinutes;
  const totalSeconds = activeMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const todayKey = getLocalDateKey(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const todaySessions = sessions.filter(
    (session) => getLocalDateKey(new Date(session.completedAt)) === todayKey
  );
  const weeklyMinutes = sessions
    .filter((session) => new Date(session.completedAt) >= sevenDaysAgo)
    .reduce((sum, session) => sum + session.duration, 0);
  const weeklyOutputLogs = sessions.filter(
    (session) =>
      new Date(session.completedAt) >= sevenDaysAgo &&
      Boolean(session.outputSummary || session.repositoryName || (session.commitCount ?? 0) > 0)
  ).length;
  const recentSessions = sessions.slice(0, 5);
  const statusTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedSettings = readStoredSettings();
      setFocusMinutes(storedSettings.focusMinutes);
      setBreakMinutes(storedSettings.breakMinutes);
      setTimeLeft(storedSettings.focusMinutes * 60);
      setHasLoadedStoredSettings(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredSettings) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ focusMinutes, breakMinutes }));
  }, [focusMinutes, breakMinutes, hasLoadedStoredSettings]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/pomodoro")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setSessions(data);
        }
      })
      .catch((error) => console.error("Failed to fetch focus sessions", error));

    return () => {
      isMounted = false;
    };
  }, []);

  const clearOutputFields = () => {
    setRepositoryName("");
    setRepositoryUrl("");
    setCommitCount(0);
    setOutputSummary("");
  };

  const startBreak = () => {
    setTimerMode("break");
    setTimeLeft(breakMinutes * 60);
    setHasCompletedBreak(false);
    setIsRunning(true);
  };

  const prepareNextFocus = ({ start = false }: { start?: boolean } = {}) => {
    setTimerMode("focus");
    setTimeLeft(focusMinutes * 60);
    setHasCompletedBreak(false);
    setIsAwaitingWrapUp(false);
    setSaveError(null);
    setIsRunning(start);
    clearOutputFields();
  };

  const completeSession = async ({ includeOutput = true }: { includeOutput?: boolean } = {}) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: focusMinutes,
          label: taskLabel.trim() || null,
          repositoryName: includeOutput ? repositoryName.trim() || null : null,
          repositoryUrl: includeOutput ? repositoryUrl.trim() || null : null,
          commitCount: includeOutput ? commitCount : 0,
          outputSummary: includeOutput ? outputSummary.trim() || null : null,
        }),
      });

      if (response.ok) {
        const session = (await response.json()) as PomodoroSessionData;
        setSessions((currentSessions) => [session, ...currentSessions]);
        setIsAwaitingWrapUp(false);
        setTaskLabel("");
        clearOutputFields();
        refreshTodayQueue();
        startBreak();
      } else {
        setSaveError("Session could not be saved. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save focus session", error);
      setSaveError("Session could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      if (timeLeft <= 1) {
        window.clearInterval(interval);
        setTimeLeft(0);
        setIsRunning(false);
        if (timerMode === "focus") {
          setIsAwaitingWrapUp(true);
        } else {
          setHasCompletedBreak(true);
        }
        setSaveError(null);
        playBeep(audioContextRef);
        return;
      }

      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const changeFocusMinutes = (minutes: number) => {
    const nextMinutes = normalizeMinutes(minutes, focusMinutes);
    setFocusMinutes(nextMinutes);
    if (timerMode === "focus") {
      setTimeLeft(nextMinutes * 60);
    }
    setIsRunning(false);
    setIsAwaitingWrapUp(false);
    setHasCompletedBreak(false);
    setSaveError(null);
    clearOutputFields();
  };

  const changeBreakMinutes = (minutes: number) => {
    const nextMinutes = normalizeMinutes(minutes, breakMinutes);
    setBreakMinutes(nextMinutes);
    if (timerMode === "break") {
      setTimeLeft(nextMinutes * 60);
      setHasCompletedBreak(false);
    }
    setIsRunning(false);
    setSaveError(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setIsAwaitingWrapUp(false);
    setHasCompletedBreak(false);
    setSaveError(null);
    clearOutputFields();
  };

  const getTimerStatus = () => {
    if (timerMode === "break") {
      if (isRunning) return "Break in progress";
      if (hasCompletedBreak || timeLeft === 0) return "Break complete";
      return "Break ready";
    }

    if (isRunning) return "Session in progress";
    if (timeLeft === 0) return "Session complete";
    return "Ready to focus";
  };

  const getTimerDetail = () => {
    if (timerMode === "break") {
      return `${breakMinutes} min break`;
    }

    return `${focusMinutes} min focus`;
  };

  const toggleTimer = () => {
    if (timerMode === "break" && (hasCompletedBreak || timeLeft === 0)) {
      prepareNextFocus({ start: true });
      return;
    }

    setIsRunning((currentValue) => !currentValue);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="yev-card yev-card-hover overflow-hidden">
        <div className="border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Focus timer</h2>
              <p className="mt-1 text-sm text-neutral-600">Choose a duration, start the timer, and log the session.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 text-primary">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          <motion.div
            layout
            transition={panelTransition}
            className={cn(
              "rounded-lg border border-neutral-200 bg-[linear-gradient(180deg,#fff,#fafafa)] px-5 py-8 text-center transition-all duration-500",
              isRunning && timerMode === "focus" && "yev-timer-active",
              timerMode === "break" && "yev-timer-break"
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.p
                key={`${timerMode}-${getTimerStatus()}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={statusTransition}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-neutral-500"
              >
                {isRunning ? (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full yev-live-signal",
                      timerMode === "break" ? "bg-emerald-500" : "bg-primary"
                    )}
                  />
                ) : null}
                {getTimerStatus()}
              </motion.p>
            </AnimatePresence>
            <div className="relative mx-auto mt-4 flex h-[12.75rem] w-full max-w-[18rem] items-center justify-center sm:h-[13.5rem] sm:max-w-[18.5rem] lg:h-[14rem] lg:max-w-[19rem]">
              <motion.div
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
                  timerMode === "break"
                    ? "border-emerald-200/80 bg-[radial-gradient(circle_at_center,rgba(236,253,245,0.98),rgba(209,250,229,0.38)_56%,rgba(255,255,255,0)_72%)]"
                    : "border-orange-200/80 bg-[radial-gradient(circle_at_center,rgba(255,247,237,0.98),rgba(254,215,170,0.34)_56%,rgba(255,255,255,0)_72%)]"
                )}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : timerMode === "break"
                      ? { scale: [1, 1.012, 1], opacity: [0.92, 1, 0.92] }
                      : isRunning
                        ? { scale: [1, 1.02, 1], opacity: [0.94, 1, 0.94] }
                        : { scale: 1, opacity: 0.96 }
                }
                transition={prefersReducedMotion ? undefined : { duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              />
              {!prefersReducedMotion ? (
                <motion.div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-[8%] rounded-full border border-white/70",
                    timerMode === "break"
                      ? "bg-[conic-gradient(from_180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.04),rgba(255,255,255,0),rgba(16,185,129,0.14))]"
                      : "bg-[conic-gradient(from_180deg,rgba(234,88,12,0.2),rgba(251,191,36,0.06),rgba(255,255,255,0),rgba(234,88,12,0.14))]"
                  )}
                  animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRunning ? { duration: timerMode === "break" ? 18 : 14, repeat: Infinity, ease: "linear" } : undefined}
                />
              ) : null}
              <div className="relative flex h-[10.5rem] w-[10.5rem] items-center justify-center rounded-full border border-white/80 bg-white/92 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:h-[11rem] sm:w-[11rem] lg:h-[12.6rem] lg:w-[12.6rem]">
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-[6%] rounded-full",
                    timerMode === "break"
                      ? "bg-[radial-gradient(circle_at_top,rgba(236,253,245,0.92),rgba(255,255,255,0.84)_68%)]"
                      : "bg-[radial-gradient(circle_at_top,rgba(255,247,237,0.92),rgba(255,255,255,0.84)_68%)]"
                  )}
                />
                <AnimatePresence initial={false} mode="wait">
                  <motion.p
                    key={timerMode}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
                    transition={panelTransition}
                    className={cn(
                      "relative z-10 max-w-full px-4 text-center font-semibold leading-none tabular-nums tracking-[-0.045em] text-neutral-950",
                      getTimerTextClassName(timeLeft)
                    )}
                  >
                    {formatTime(timeLeft)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <div className="mx-auto mt-5 max-w-md">
              <Progress value={progress} className="h-2 bg-orange-100" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>{Math.round(progress)}%</span>
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    key={getTimerDetail()}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 6 }}
                    transition={statusTransition}
                  >
                    {getTimerDetail()}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <label className="space-y-2">
              <span className="text-xs font-medium text-neutral-600">Current task</span>
              <Input
                value={taskLabel}
                onChange={(event) => setTaskLabel(event.target.value)}
                placeholder="What are you working on?"
                className="h-10 rounded-md border-neutral-200 bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium text-neutral-600">Custom minutes</span>
              <Input
                type="number"
                min={1}
                max={180}
                value={focusMinutes}
                onChange={(event) => changeFocusMinutes(Number(event.target.value))}
                disabled={isRunning || timerMode === "break"}
                className="h-10 rounded-md border-neutral-200 bg-white"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 p-2 sm:grid-cols-2 sm:gap-3 sm:p-3 xl:grid-cols-4">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => changeFocusMinutes(preset)}
                disabled={isRunning || timerMode === "break"}
                className={cn(
                  "flex h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  focusMinutes === preset
                    ? "border-primary bg-orange-100 text-primary shadow-[0_12px_22px_-18px_rgba(234,88,12,0.32)]"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/40 hover:text-primary"
                )}
              >
                {preset} min
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_132px]">
            <Button
              onClick={toggleTimer}
              disabled={(timerMode === "focus" && timeLeft === 0) || isSaving || isAwaitingWrapUp}
              className="h-11 w-full justify-center rounded-lg text-sm"
              variant={isRunning ? "secondary" : "default"}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning
                ? "Pause"
                : timerMode === "break" && (hasCompletedBreak || timeLeft === 0)
                  ? "Start next focus"
                  : timerMode === "break"
                    ? "Start break"
                    : "Start focus"}
            </Button>
            <Button onClick={resetTimer} variant="outline" className="h-11 w-full justify-center rounded-lg text-sm">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {timerMode === "break" ? (
              <motion.div
                key="break-panel"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(8px)" }}
                transition={panelTransition}
                className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {hasCompletedBreak || timeLeft === 0 ? "Break complete" : "Break time"}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      {hasCompletedBreak || timeLeft === 0
                        ? "Your next focus block is ready when you are."
                        : "Step away for a moment. The next focus block can start fresh after this."}
                    </p>
                  </div>
                  <TimerReset className="h-4 w-4 shrink-0 text-emerald-700" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_144px]">
                  <Button
                    onClick={() => prepareNextFocus({ start: true })}
                    disabled={isRunning && !hasCompletedBreak}
                    className="h-11 w-full justify-center rounded-lg text-sm"
                  >
                    <Play className="h-4 w-4" />
                    Start next focus
                  </Button>
                  <Button
                    onClick={() => prepareNextFocus()}
                    variant="outline"
                    className="h-11 w-full justify-center rounded-lg text-sm"
                  >
                    Skip break
                  </Button>
                </div>
              </motion.div>
            ) : isAwaitingWrapUp ? (
              <motion.div
                key="wrap-up-panel"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(8px)" }}
                transition={panelTransition}
                className="rounded-lg border border-primary/20 bg-orange-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-950">Session output</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Capture what changed before this focus block disappears into a number.
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_120px]">
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-neutral-600">Repository</span>
                    <Input
                      value={repositoryName}
                      onChange={(event) => setRepositoryName(event.target.value)}
                      placeholder="owner/repo"
                      className="h-9 rounded-md border-neutral-200 bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-neutral-600">Repository URL</span>
                    <Input
                      value={repositoryUrl}
                      onChange={(event) => setRepositoryUrl(event.target.value)}
                      placeholder="https://github.com/..."
                      className="h-9 rounded-md border-neutral-200 bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-medium text-neutral-600">Commits</span>
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      value={commitCount}
                      onChange={(event) => setCommitCount(normalizeCommitCount(event.target.value))}
                      className="h-9 rounded-md border-neutral-200 bg-white"
                    />
                  </label>
                </div>

                <label className="mt-3 block space-y-2">
                  <span className="text-xs font-medium text-neutral-600">Output summary</span>
                  <textarea
                    value={outputSummary}
                    onChange={(event) => setOutputSummary(event.target.value)}
                    placeholder="What shipped, improved, or became clearer?"
                    className="min-h-24 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary/50 focus:ring-3 focus:ring-primary/15"
                  />
                </label>

                {saveError ? <p className="mt-3 text-sm text-destructive">{saveError}</p> : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_176px]">
                  <Button onClick={() => void completeSession()} disabled={isSaving} className="h-11 w-full justify-center rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    {isSaving ? "Saving session..." : "Save session output"}
                  </Button>
                  <Button
                    onClick={() => void completeSession({ includeOutput: false })}
                    variant="outline"
                    disabled={isSaving}
                    className="h-11 w-full justify-center rounded-lg text-sm"
                  >
                    Save without output
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="yev-card yev-card-hover p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Focus settings</h2>
              <p className="mt-1 text-sm text-neutral-600">Saved on this device.</p>
            </div>
            <Settings2 className="h-4 w-4 text-primary" />
          </div>

          <div className="mt-4 grid gap-3">
            <label className="space-y-2">
              <span className="text-xs font-medium text-neutral-600">Break minutes</span>
              <Input
                type="number"
                min={1}
                max={60}
                value={breakMinutes}
                onChange={(event) => changeBreakMinutes(Number(event.target.value))}
                disabled={isRunning}
                className="h-9 rounded-md border-neutral-200 bg-white"
              />
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5">
              <p className="text-xs text-neutral-500">Next break</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{breakMinutes} minutes</p>
            </div>
          </div>
        </section>

        <section className="yev-card yev-card-hover p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Progress</h2>
              <p className="mt-1 text-sm text-neutral-600">Your recent focus activity.</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>

          <div className="mt-4 grid gap-2.5">
            <FocusStat label="Today" value={`${todaySessions.length} sessions`} />
            <FocusStat label="This week" value={`${weeklyMinutes} minutes`} />
            <FocusStat label="Output logs" value={`${weeklyOutputLogs} this week`} />
          </div>
        </section>

        <section className="yev-card yev-card-hover overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-950">Recent sessions</h2>
            <TimerReset className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="divide-y divide-neutral-200">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session.id} className="px-5 py-3">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-950">
                    {session.label || "Focus session"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {session.duration} min - {new Date(session.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {session.repositoryName || (session.commitCount ?? 0) > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                      {session.repositoryName ? (
                        session.repositoryUrl ? (
                          <a
                            href={session.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-neutral-700 transition-colors hover:text-neutral-950"
                          >
                            <Link2 className="h-3 w-3" />
                            {session.repositoryName}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-neutral-700">
                            <Link2 className="h-3 w-3" />
                            {session.repositoryName}
                          </span>
                        )
                      ) : null}
                      {(session.commitCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-primary">
                          <GitCommitHorizontal className="h-3 w-3" />
                          {session.commitCount} commits
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {session.outputSummary ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                      {session.outputSummary}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-medium text-neutral-950">No sessions yet</p>
                <p className="mt-1 text-sm text-neutral-500">Complete a timer to start the log.</p>
              </div>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function FocusStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-950">{value}</span>
    </div>
  );
}
