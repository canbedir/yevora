import { cacheLife } from 'next/cache'
import { ArrowUpRight, Newspaper } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HNStory {
  id: number
  title: string
  url: string
  score: number
  by: string
}

async function getTopStories(): Promise<HNStory[]> {
  'use cache'
  cacheLife('hours')

  const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  if (!topStoriesRes.ok) throw new Error('Failed to fetch HN top stories')
  
  const storyIds: number[] = await topStoriesRes.json()
  const top5Ids = storyIds.slice(0, 5)

  const stories = await Promise.all(
    top5Ids.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      if (!res.ok) throw new Error(`Failed to fetch HN story ${id}`)
      return res.json()
    })
  )

  return stories
}

export async function HackerNewsFeed() {
  const stories = await getTopStories()

  return (
    <Card className="dashboard-panel rounded-[30px] border-0 py-0">
      <CardHeader className="flex flex-row items-start justify-between border-b border-white/60 px-6 py-5">
        <div className="space-y-1">
          <CardTitle className="text-lg">Hacker News radar</CardTitle>
          <p className="text-sm text-muted-foreground">A quick pulse on what the wider dev world is reading right now.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-white/70 bg-white/70 px-2.5 py-1 text-[11px]">
          <Newspaper className="h-3 w-3" />
          Live feed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-6 py-5">
        {stories.map((story, index) => (
          <a
            key={story.id}
            href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-[22px] border border-white/60 bg-white/70 px-4 py-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_20px_46px_-32px_rgba(15,23,42,0.34)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 font-medium text-foreground">{story.title}</p>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                {story.score} points by {story.by}
              </div>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
