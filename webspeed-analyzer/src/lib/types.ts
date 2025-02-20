export interface SpeedTestResult {
  url: string
  device: 'mobile' | 'desktop'
  performance_score: number
  metrics: {
    first_contentful_paint: string
    largest_contentful_paint: string
    total_blocking_time: string
    cumulative_layout_shift: string
  }
  recommendations: RecommendationItem[]
  metrics_explanation: MetricsExplanation
}

export interface PageSpeedMetrics {
  first_contentful_paint: number
  largest_contentful_paint: number
  total_blocking_time: number
  cumulative_layout_shift: number
}

export interface RecommendationItem {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'performance' | 'seo' | 'best-practices' | 'accessibility'
  impact: number
  solution: string
}

export interface MetricsExplanation {
  [key: string]: {
    title: string
    description: string
    status: 'good' | 'needs-improvement' | 'poor'
  }
}