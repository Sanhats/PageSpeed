import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpeedTestResult } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Smartphone, Monitor } from 'lucide-react'

interface HistoryListProps {
  items: SpeedTestResult[]
  onItemClick: (item: SpeedTestResult) => void
}

export function HistoryList({ items, onItemClick }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay análisis previos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onItemClick(item)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {item.device === 'mobile' ? (
                  <Smartphone className="w-6 h-6" />
                ) : (
                  <Monitor className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.url}</p>
                <p className="text-sm text-muted-foreground">
                  Score: {Math.round(item.performance_score)}
                </p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}