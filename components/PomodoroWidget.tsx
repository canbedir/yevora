'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Clock3, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

const DEFAULT_TIME = 25 * 60

export function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [completedToday, setCompletedToday] = useState(0)
  const [label, setLabel] = useState('')

  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let isMounted = true

    fetch('/api/pomodoro')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) {
          return
        }

        const today = new Date().toISOString().split('T')[0]
        const todaySessions = data.filter((session) => session.completedAt.startsWith(today))
        setCompletedToday(todaySessions.length)
      })
      .catch((error) => console.error('Failed to fetch pomodoro sessions', error))

    return () => {
      isMounted = false
    }
  }, [])

  const playBeep = useEffectEvent(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime) // A4
      
      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.error('Audio playback failed', e)
    }
  })

  const handleComplete = useEffectEvent(async () => {
    try {
      const res = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 25, label }),
      })
      if (res.ok) {
        setCompletedToday((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Failed to save pomodoro session', error)
    }
  })

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      return
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          playBeep()
          void handleComplete()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, timeLeft])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(DEFAULT_TIME)
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const progress = (1 - timeLeft / DEFAULT_TIME) * 100

  return (
    <Card className="dashboard-panel rounded-[30px] border-0 py-0">
      <CardHeader className="border-b border-white/60 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock3 className="h-5 w-5 text-primary" />
              Focus session
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Start a clean 25 minute sprint and keep your flow visible.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-white/70 bg-white/70 px-2.5 py-1 text-[11px]">
            <Sparkles className="h-3 w-3" />
            {completedToday} completed today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-6">
        <div className="rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,250,251,0.78))] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="mb-2 text-center text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {isRunning ? 'Session in progress' : 'Ready to focus'}
          </div>
          <div className="text-center text-6xl font-bold tabular-nums">
          {minutes}:{seconds}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-white/65" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Current task
          </label>
          <Input
            placeholder="What are you working on?"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isRunning}
            className="h-11 rounded-2xl border-white/70 bg-white/80"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={toggleTimer}
            className="w-full flex-1"
            variant={isRunning ? 'secondary' : 'default'}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 mr-2" /> Pause</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Start</>
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
