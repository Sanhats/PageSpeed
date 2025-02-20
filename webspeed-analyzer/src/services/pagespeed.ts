import axios from 'axios'
import { PageSpeedMetrics } from '@/lib/types'

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export async function analyzeUrl(url: string, device: 'mobile' | 'desktop') {
  try {
    const response = await axios.get(PAGESPEED_API_URL, {
      params: {
        url,
        key: process.env.GOOGLE_PAGESPEED_API_KEY,
        strategy: device,
      },
    })

    const { lighthouseResult } = response.data
    
    // Verificar si tenemos los datos necesarios
    if (!lighthouseResult || !lighthouseResult.audits || !lighthouseResult.categories) {
      throw new Error('Invalid PageSpeed Insights response')
    }

    const metrics = extractMetrics(lighthouseResult)
    const recommendations = extractRecommendations(lighthouseResult)
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

function extractRecommendations(result: any): string[] {
  const recommendations: string[] = []
  const { audits } = result

  // Función auxiliar para verificar auditorías
  const checkAudit = (auditName: string, recommendation: string) => {
    if (audits[auditName] && audits[auditName].score !== undefined && audits[auditName].score < 0.9) {
      recommendations.push(recommendation)
    }
  }

  // Verificar cada auditoría de forma segura
  checkAudit('render-blocking-resources', 'Reducir recursos que bloquean el renderizado')
  checkAudit('unminified-javascript', 'Minificar archivos JavaScript')
  checkAudit('unminified-css', 'Minificar archivos CSS')
  checkAudit('unused-javascript', 'Eliminar código JavaScript no utilizado')
  checkAudit('unused-css-rules', 'Eliminar reglas CSS no utilizadas')
  checkAudit('uses-optimized-images', 'Optimizar imágenes')
  checkAudit('enable-text-compression', 'Habilitar compresión GZIP')
  
  // Agregar recomendaciones adicionales basadas en otras métricas
  if (audits['largest-contentful-paint']?.numericValue > 2500) {
    recommendations.push('Mejorar el Largest Contentful Paint (LCP)')
  }

  if (audits['first-contentful-paint']?.numericValue > 2000) {
    recommendations.push('Mejorar el First Contentful Paint (FCP)')
  }

  if (audits['total-blocking-time']?.numericValue > 300) {
    recommendations.push('Reducir el tiempo de bloqueo total')
  }

  return recommendations
}