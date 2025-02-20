import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricsExplanation } from '@/lib/types'
import { CheckCircle, AlertTriangle, MinusCircle } from 'lucide-react'

interface MetricsSectionProps {
  metrics: {
    [key: string]: string
  }
  explanation: MetricsExplanation
}

export function MetricsSection({ metrics, explanation }: MetricsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500 bg-green-50'
      case 'needs-improvement':
        return 'text-yellow-500 bg-yellow-50'
      case 'poor':
        return 'text-red-500 bg-red-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5" />
      case 'needs-improvement':
        return <MinusCircle className="w-5 h-5" />
      case 'poor':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <MinusCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(metrics).map(([key, value]) => {
        const exp = explanation[key]
        return (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{exp.title}</CardTitle>
                  <CardDescription className="text-sm">{exp.description}</CardDescription>
                </div>
                <span className={`p-1 rounded-full ${getStatusColor(exp.status)}`}>
                  {getStatusIcon(exp.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}