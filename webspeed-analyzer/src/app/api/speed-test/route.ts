import axios from 'axios'
import { PageSpeedMetrics } from '@/lib/types'

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

interface RecommendationItem {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'performance' | 'seo' | 'best-practices' | 'accessibility'
  impact: number
  solution: string
}

export async function analyzeUrl(url: string, device: 'mobile' | 'desktop') {
  try {
    const response = await axios.get(PAGESPEED_API_URL, {
      params: {
        url,
        key: process.env.GOOGLE_PAGESPEED_API_KEY,
        strategy: device,
        category: ['performance', 'seo', 'best-practices', 'accessibility']
      },
    })

    const { lighthouseResult } = response.data
    
    if (!lighthouseResult || !lighthouseResult.audits || !lighthouseResult.categories) {
      throw new Error('Invalid PageSpeed Insights response')
    }

    const metrics = extractMetrics(lighthouseResult)
    const recommendations = extractDetailedRecommendations(lighthouseResult)
    const performanceScore = lighthouseResult.categories.performance?.score * 100 || 0

    return {
      url,
      device,
      performance_score: performanceScore,
      metrics: {
        first_contentful_paint: `${metrics.first_contentful_paint.toFixed(1)}s`,
        largest_contentful_paint: `${metrics.largest_contentful_paint.toFixed(1)}s`,
        total_blocking_time: `${metrics.total_blocking_time.toFixed(0)}ms`,
        cumulative_layout_shift: metrics.cumulative_layout_shift.toFixed(3),
      },
      recommendations,
      metrics_explanation: getMetricsExplanation(metrics)
    }
  } catch (error) {
    console.error('Error analyzing URL:', error)
    throw new Error('Failed to analyze URL')
  }
}

function extractMetrics(result: any): PageSpeedMetrics {
  const { audits } = result
  
  return {
    first_contentful_paint: (audits['first-contentful-paint']?.numericValue || 0) / 1000,
    largest_contentful_paint: (audits['largest-contentful-paint']?.numericValue || 0) / 1000,
    total_blocking_time: audits['total-blocking-time']?.numericValue || 0,
    cumulative_layout_shift: audits['cumulative-layout-shift']?.numericValue || 0,
  }
}

function extractDetailedRecommendations(result: any): RecommendationItem[] {
  const recommendations: RecommendationItem[] = []
  const { audits } = result

  // Función auxiliar para determinar la prioridad basada en el impacto
  const getPriority = (score: number): 'high' | 'medium' | 'low' => {
    if (score < 0.5) return 'high'
    if (score < 0.8) return 'medium'
    return 'low'
  }

  // Rendimiento
  if (audits['render-blocking-resources']?.score < 0.9) {
    recommendations.push({
      title: 'Eliminar recursos que bloquean el renderizado',
      description: 'Los recursos que bloquean el renderizado aumentan el tiempo que tarda tu página en mostrarse.',
      priority: getPriority(audits['render-blocking-resources'].score),
      category: 'performance',
      impact: (1 - audits['render-blocking-resources'].score) * 100,
      solution: 'Considera cargar CSS crítico en línea y usar async/defer para scripts no críticos.'
    })
  }

  if (audits['unused-javascript']?.score < 0.9) {
    recommendations.push({
      title: 'Reducir JavaScript no utilizado',
      description: 'El JavaScript no utilizado aumenta los tiempos de carga y el consumo de datos.',
      priority: getPriority(audits['unused-javascript'].score),
      category: 'performance',
      impact: (1 - audits['unused-javascript'].score) * 100,
      solution: 'Implementa code splitting y carga dinámica de módulos JavaScript.'
    })
  }

  if (audits['uses-optimized-images']?.score < 0.9) {
    recommendations.push({
      title: 'Optimizar imágenes',
      description: 'Las imágenes sin optimizar aumentan significativamente el tiempo de carga.',
      priority: getPriority(audits['uses-optimized-images'].score),
      category: 'performance',
      impact: (1 - audits['uses-optimized-images'].score) * 100,
      solution: 'Utiliza formatos modernos como WebP, comprime imágenes y usa srcset para imágenes responsivas.'
    })
  }

  if (audits['enable-text-compression']?.score < 0.9) {
    recommendations.push({
      title: 'Habilitar compresión de texto',
      description: 'La compresión de texto puede reducir significativamente el tamaño de la transferencia.',
      priority: getPriority(audits['enable-text-compression'].score),
      category: 'performance',
      impact: (1 - audits['enable-text-compression'].score) * 100,
      solution: 'Habilita GZIP o Brotli en tu servidor web.'
    })
  }

  // Caché
  if (audits['uses-long-cache-ttl']?.score < 0.9) {
    recommendations.push({
      title: 'Mejorar política de caché',
      description: 'Una política de caché eficiente mejora los tiempos de carga para usuarios recurrentes.',
      priority: getPriority(audits['uses-long-cache-ttl'].score),
      category: 'best-practices',
      impact: (1 - audits['uses-long-cache-ttl'].score) * 100,
      solution: 'Configura encabezados de caché apropiados para recursos estáticos.'
    })
  }

  // SEO
  if (audits['meta-description']?.score < 1) {
    recommendations.push({
      title: 'Añadir meta descripción',
      description: 'La meta descripción es importante para SEO y visibilidad en resultados de búsqueda.',
      priority: 'medium',
      category: 'seo',
      impact: 50,
      solution: 'Añade una meta descripción descriptiva y única para la página.'
    })
  }

  return recommendations.sort((a, b) => b.impact - a.impact)
}

function getMetricsExplanation(metrics: PageSpeedMetrics) {
  return {
    first_contentful_paint: {
      title: 'First Contentful Paint (FCP)',
      description: 'Mide el tiempo desde que la página comienza a cargarse hasta que cualquier parte del contenido se renderiza en la pantalla.',
      status: metrics.first_contentful_paint < 1.8 ? 'good' : metrics.first_contentful_paint < 3 ? 'needs-improvement' : 'poor'
    },
    largest_contentful_paint: {
      title: 'Largest Contentful Paint (LCP)',
      description: 'Mide el tiempo desde que la página comienza a cargarse hasta que el contenido visible más grande se renderiza en la pantalla.',
      status: metrics.largest_contentful_paint < 2.5 ? 'good' : metrics.largest_contentful_paint < 4 ? 'needs-improvement' : 'poor'
    },
    total_blocking_time: {
      title: 'Total Blocking Time (TBT)',
      description: 'Suma de todos los períodos entre FCP y Time to Interactive donde la duración de la tarea supera los 50ms.',
      status: metrics.total_blocking_time < 200 ? 'good' : metrics.total_blocking_time < 600 ? 'needs-improvement' : 'poor'
    },
    cumulative_layout_shift: {
      title: 'Cumulative Layout Shift (CLS)',
      description: 'Mide la suma de todos los cambios inesperados en el diseño de la página.',
      status: metrics.cumulative_layout_shift < 0.1 ? 'good' : metrics.cumulative_layout_shift < 0.25 ? 'needs-improvement' : 'poor'
    }
  }
}