'use client'

import { useState } from 'react'
import { SpeedTestResult } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Smartphone, Monitor, Clock, Gauge } from 'lucide-react'
import { useHistory } from '@/lib/contexts/history-context'
import { HistoryList } from '@/components/history-list'
import { MetricsSection } from '@/components/MetricsSection'	
import { RecommendationsSection } from '@/components/RecomendationsSection'

export default function Home() {
  const [url, setUrl] = useState('')
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile')
  const [result, setResult] = useState<SpeedTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { history, addToHistory } = useHistory()
  const [compareResult, setCompareResult] = useState<SpeedTestResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCompareResult(null)

    try {
      const response = await fetch(
        `/api/speed-test?url=${encodeURIComponent(url)}&device=${device}`
      )
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar la URL')
      }
      
      setResult(data)
      addToHistory(data)
    } catch (err: any) {
      setError(err.message || 'Error al analizar la URL')
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    const otherDevice = device === 'mobile' ? 'desktop' : 'mobile'
    setLoading(true)
    
    try {
      const response = await fetch(
        `/api/speed-test?url=${encodeURIComponent(url)}&device=${otherDevice}`
      )
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar la URL')
      }
      
      setCompareResult(data)
      addToHistory(data)
    } catch (err: any) {
      setError(err.message || 'Error al analizar la URL')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Globe className="w-8 h-8" />
              WebSpeed Analyzer
            </CardTitle>
            <CardDescription>
              Analiza el rendimiento de cualquier sitio web y obtén recomendaciones de optimización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ingresa la URL a analizar"
                  className="flex-1"
                  required
                />
                <Select value={device} onValueChange={(value: 'mobile' | 'desktop') => setDevice(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Móvil
                      </div>
                    </SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Escritorio
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Analizando...' : 'Analizar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {result && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Puntuación de Rendimiento</CardTitle>
                    <CardDescription>Evaluación general del rendimiento del sitio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative w-48 h-48">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-4xl font-bold ${getScoreColor(result.performance_score)}`}>
                            {Math.round(result.performance_score)}
                          </span>
                        </div>
                        <Progress
                          value={result.performance_score}
                          className={`h-48 w-48 [&>div]:h-full [&>div]:w-full rounded-full ${getProgressColor(result.performance_score)}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="metrics" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="metrics">
                      <Clock className="w-4 h-4 mr-2" />
                      Métricas
                    </TabsTrigger>
                    <TabsTrigger value="recommendations">
                      <Gauge className="w-4 h-4 mr-2" />
                      Recomendaciones
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metrics">
  <Card>
    <CardHeader>
      <CardTitle>Métricas de Rendimiento</CardTitle>
      <CardDescription>Métricas clave de rendimiento web</CardDescription>
    </CardHeader>
    <CardContent>
      <MetricsSection 
        metrics={result.metrics} 
        explanation={result.metrics_explanation} 
      />
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="recommendations">
  <Card>
    <CardHeader>
      <CardTitle>Recomendaciones de Optimización</CardTitle>
      <CardDescription>Sugerencias para mejorar el rendimiento</CardDescription>
    </CardHeader>
    <CardContent>
      <RecommendationsSection recommendations={result.recommendations} />
    </CardContent>
  </Card>
</TabsContent>
                </Tabs>

                {!compareResult && (
                  <Button
                    onClick={handleCompare}
                    disabled={loading}
                    className="mt-4"
                  >
                    Comparar con {device === 'mobile' ? 'escritorio' : 'móvil'}
                  </Button>
                )}

                {compareResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparación de Dispositivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">
                            {result?.device === 'mobile' ? 'Móvil' : 'Escritorio'}
                          </h3>
                          <div className="text-2xl font-bold">
                            {Math.round(result?.performance_score || 0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">
                            {compareResult.device === 'mobile' ? 'Móvil' : 'Escritorio'}
                          </h3>
                          <div className="text-2xl font-bold">
                            {Math.round(compareResult.performance_score)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryList
                  items={history}
                  onItemClick={(item) => {
                    setUrl(item.url)
                    setDevice(item.device)
                    setResult(item)
                    setCompareResult(null)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}