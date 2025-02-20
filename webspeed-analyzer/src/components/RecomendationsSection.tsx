import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecommendationItem } from '@/lib/types'
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react'

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[]
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50'
      case 'medium':
        return 'text-yellow-500 bg-yellow-50'
      case 'low':
        return 'text-green-500 bg-green-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />
      case 'medium':
        return <Info className="w-5 h-5" />
      case 'low':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'performance':
        return 'Rendimiento'
      case 'seo':
        return 'SEO'
      case 'best-practices':
        return 'Buenas Prácticas'
      case 'accessibility':
        return 'Accesibilidad'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-blue-100 text-blue-700'
      case 'seo':
        return 'bg-purple-100 text-purple-700'
      case 'best-practices':
        return 'bg-green-100 text-green-700'
      case 'accessibility':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <Card key={index} className="border-l-4" style={{
          borderLeftColor: rec.priority === 'high' ? '#ef4444' : 
                          rec.priority === 'medium' ? '#f59e0b' : '#22c55e'
        }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className={`p-1.5 rounded-full ${getPriorityColor(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                  </span>
                  {rec.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rec.category)}`}>
                    {getCategoryLabel(rec.category)}
                  </span>
                  <span className="text-sm">
                    Impacto: {Math.round(rec.impact)}%
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{rec.description}</p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-medium flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Solución recomendada:
              </p>
              <p className="text-sm text-muted-foreground">{rec.solution}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}