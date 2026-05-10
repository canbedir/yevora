import { cacheLife } from 'next/cache'
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hacker News</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col gap-1">
            <a 
              href={story.url || `https://news.ycombinator.com/item?id=${story.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium hover:underline line-clamp-2"
            >
              {story.title}
            </a>
            <div className="text-sm text-muted-foreground">
              {story.score} points by {story.by}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
