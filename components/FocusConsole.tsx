"use client";

import { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const FOCUS_PRESETS = [15, 25, 45, 60];
const STORAGE_KEY = "yevora.focusSettings";
const DEFAULT_FOCUS_SETTINGS = { focusMinutes: 25, breakMinutes: 5 };

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
  const [taskLabel, setTaskLabel] = useState("");
  const [repositoryName, setRepositoryName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [commitCount, setCommitCount] = useState(0);
  const [outputSummary, setOutputSummary] = useState("");
  const [sessions, setSessions] = useState<PomodoroSessionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAwaitingWrapUp, setIsAwaitingWrapUp] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasLoadedStoredSettings, setHasLoadedStoredSettings] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalSeconds = focusMinutes * 60;
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
        setTimeLeft(totalSeconds);
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
        setIsAwaitingWrapUp(true);
        setSaveError(null);
        playBeep(audioContextRef);
        return;
      }

      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, timeLeft]);

  const changeFocusMinutes = (minutes: number) => {
    const nextMinutes = normalizeMinutes(minutes, focusMinutes);
    setFocusMinutes(nextMinutes);
    setTimeLeft(nextMinutes * 60);
    setIsRunning(false);
    setIsAwaitingWrapUp(false);
    setSaveError(null);
    clearOutputFields();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setIsAwaitingWrapUp(false);
    setSaveError(null);
    clearOutputFields();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="yev-card overflow-hidden">
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
          <div className="rounded-lg border border-neutral-200 bg-[linear-gradient(180deg,#fff,#fafafa)] px-5 py-8 text-center">
            <p className="text-sm font-medium text-neutral-500">
              {isRunning ? "Session in progress" : timeLeft === 0 ? "Session complete" : "Ready to focus"}
            </p>
            <p className="mt-3 text-7xl font-semibold tabular-nums text-neutral-950">{formatTime(timeLeft)}</p>
            <div className="mx-auto mt-6 max-w-md">
              <Progress value={progress} className="h-2 bg-orange-100" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>{Math.round(progress)}%</span>
                <span>{focusMinutes} min focus</span>
              </div>
            </div>
          </div>

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
                disabled={isRunning}
                className="h-10 rounded-md border-neutral-200 bg-white"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => changeFocusMinutes(preset)}
                disabled={isRunning}
                className={cn(
                  "h-10 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  focusMinutes === preset
                    ? "border-primary bg-orange-100 text-primary"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/40 hover:text-primary"
                )}
              >
                {preset} min
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => setIsRunning((currentValue) => !currentValue)}
              disabled={timeLeft === 0 || isSaving || isAwaitingWrapUp}
              className="h-10 flex-1"
              variant={isRunning ? "secondary" : "default"}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start focus"}
            </Button>
            <Button onClick={resetTimer} variant="outline" className="h-10 sm:w-32">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {isAwaitingWrapUp ? (
            <div className="rounded-lg border border-primary/20 bg-orange-50/60 p-4">
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

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void completeSession()} disabled={isSaving} className="h-10 flex-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? "Saving session..." : "Save session output"}
                </Button>
                <Button
                  onClick={() => void completeSession({ includeOutput: false })}
                  variant="outline"
                  disabled={isSaving}
                  className="h-10 sm:w-44"
                >
                  Save without output
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="yev-card p-5">
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
                onChange={(event) => setBreakMinutes(normalizeMinutes(event.target.value, breakMinutes))}
                className="h-9 rounded-md border-neutral-200 bg-white"
              />
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5">
              <p className="text-xs text-neutral-500">Next break</p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">{breakMinutes} minutes</p>
            </div>
          </div>
        </section>

        <section className="yev-card p-5">
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

        <section className="yev-card overflow-hidden">
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
