'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Play, Pause, RotateCcw } from 'lucide-react'

const DEFAULT_TIME = 25 * 60

export function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [completedToday, setCompletedToday] = useState(0)
  const [label, setLabel] = useState('')
  
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Fetch initial completed sessions for today
    fetch('/api/pomodoro')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split('T')[0]
          const todaySessions = data.filter((s) => s.completedAt.startsWith(today))
          setCompletedToday(todaySessions.length)
        }
      })
      .catch((err) => console.error('Failed to fetch pomodoro sessions', err))
  }, [])

  const playBeep = () => {
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
  }

  const handleComplete = async () => {
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
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isRunning && timeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRunning(false)
      playBeep()
      handleComplete()
    }

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Pomodoro timer
          <span className="text-sm font-normal text-muted-foreground">
            {completedToday} completed today
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-6xl font-bold text-center tabular-nums py-4">
          {minutes}:{seconds}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex gap-2">
          <Input 
            placeholder="What are you working on?" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isRunning}
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
