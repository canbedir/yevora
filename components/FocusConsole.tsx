"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, Pause, Play, RotateCcw, Settings2, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const FOCUS_PRESETS = [15, 25, 45, 60];
const STORAGE_KEY = "yevora.focusSettings";

interface StoredFocusSettings {
  focusMinutes: number;
  breakMinutes: number;
}

interface PomodoroSessionData {
  id: string;
  duration: number;
  label?: string | null;
  completedAt: string;
}

function readStoredSettings(): StoredFocusSettings {
  if (typeof window === "undefined") {
    return { focusMinutes: 25, breakMinutes: 5 };
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const parsed = storedValue ? (JSON.parse(storedValue) as Partial<StoredFocusSettings>) : null;
    const focusMinutes = normalizeMinutes(parsed?.focusMinutes, 25);
    const breakMinutes = normalizeMinutes(parsed?.breakMinutes, 5);

    return { focusMinutes, breakMinutes };
  } catch {
    return { focusMinutes: 25, breakMinutes: 5 };
  }
}

function normalizeMinutes(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(180, Math.max(1, Math.round(numberValue)));
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

export function FocusConsole() {
  const initialSettings = useMemo(() => readStoredSettings(), []);
  const [focusMinutes, setFocusMinutes] = useState(initialSettings.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(initialSettings.breakMinutes);
  const [timeLeft, setTimeLeft] = useState(initialSettings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskLabel, setTaskLabel] = useState("");
  const [sessions, setSessions] = useState<PomodoroSessionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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
  const recentSessions = sessions.slice(0, 5);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ focusMinutes, breakMinutes }));
  }, [focusMinutes, breakMinutes]);

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

  const playBeep = useEffectEvent(() => {
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
  });

  const completeSession = useEffectEvent(async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: focusMinutes,
          label: taskLabel.trim() || null,
        }),
      });

      if (response.ok) {
        const session = (await response.json()) as PomodoroSessionData;
        setSessions((currentSessions) => [session, ...currentSessions]);
      }
    } catch (error) {
      console.error("Failed to save focus session", error);
    } finally {
      setIsSaving(false);
    }
  });

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          playBeep();
          void completeSession();
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, timeLeft]);

  const changeFocusMinutes = (minutes: number) => {
    const nextMinutes = normalizeMinutes(minutes, focusMinutes);
    setFocusMinutes(nextMinutes);
    setTimeLeft(nextMinutes * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
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
              disabled={timeLeft === 0 || isSaving}
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
                    {session.duration} min · {new Date(session.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
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
