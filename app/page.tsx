'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, CheckCircle, XCircle, Clock, Database, GitBranch, RefreshCw, Activity } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import CotexAgentChatBot from './snowflake/cortex/agent/page'
import { CONSTANTS } from '@/lib/constants'

interface PipelineStatus {
  id: string
  name: string
  status: 'running' | 'success' | 'failed' | 'idle'
  lastRun: string
  duration: number
  testsPass: number
  testsTotal: number
}

interface DataFreshness {
  table: string
  lastUpdated: string
  freshnessScore: number
  status: 'fresh' | 'stale' | 'critical'
}

interface LineageChange {
  id: string
  type: 'added' | 'modified' | 'removed'
  entity: string
  timestamp: string
  author: string
}

export default function AdminPortal() {
  const [isScanning, setIsScanning] = useState(false)
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([])
  const [freshness, setFreshness] = useState<DataFreshness[]>([])
  const [lineageChanges, setLineageChanges] = useState<LineageChange[]>([])
  const [lastScanTime, setLastScanTime] = useState<string>('')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [pipelinesRes, freshnessRes, lineageRes] = await Promise.all([
        fetch('/api/openmetadata/pipelines'),
        fetch('/api/openmetadata/data-freshness'),
        fetch('/api/openmetadata/lineage-changes')
      ])

      const pipelinesData = await pipelinesRes.json()
      const freshnessData = await freshnessRes.json()
      const lineageData = await lineageRes.json()

      setPipelines(pipelinesData)
      setFreshness(freshnessData)
      setLineageChanges(lineageData)
      setLastScanTime(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handleScanNow = async () => {
    setIsScanning(true)
    try {
      const response = await fetch('/api/trigger-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        toast({
          title: "Scan Initiated",
          description: "OpenMetadata ingestion pipeline has been triggered successfully.",
        })
        // Refresh data after a short delay
        setTimeout(fetchDashboardData, 2000)
      } else {
        throw new Error('Failed to trigger scan')
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to trigger the ingestion pipeline. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getFreshnessColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-green-500'
      case 'stale': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-100 text-green-800'
      case 'modified': return 'bg-blue-100 text-blue-800'
      case 'removed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const overallHealth = pipelines.length > 0 
    ? Math.round((pipelines.filter(p => p.status === 'success').length / pipelines.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{CONSTANTS.APP_TITLE}</h1>
            <p className="text-gray-600 mt-1">
              {CONSTANTS.APP_DESCRIPTION}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {CONSTANTS.LAST_UPDATED} {lastScanTime}
            </div>
            <Button 
              onClick={handleScanNow} 
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {CONSTANTS.SCANNING}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {CONSTANTS.SCAN_NOW}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{CONSTANTS.OVERALL_HEALTH}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallHealth}%</div>
              <Progress value={overallHealth} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{CONSTANTS.ACTIVE_PIPELINES}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelines.filter(p => p.status === 'running').length}</div>
              <p className="text-xs text-muted-foreground">
                of {pipelines.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{CONSTANTS.FRESH_TABLES}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freshness.filter(f => f.status === 'fresh').length}</div>
              <p className="text-xs text-muted-foreground">
                of {freshness.length} monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{CONSTANTS.RECENT_CHANGES}</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lineageChanges.length}</div>
              <p className="text-xs text-muted-foreground">
                {CONSTANTS.LAST24_HRS}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="cortex-agent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cortex-agent">{process.env.NEXT_PUBLIC_TAB_SNOWFLAKE_CORTEX_AGENT_NAME}</TabsTrigger>
            <TabsTrigger value="lineage">{process.env.NEXT_PUBLIC_TAB_LINEAGE_NAME}</TabsTrigger>
            <TabsTrigger value="pipelines">{process.env.NEXT_PUBLIC_TAB_PIPELINE_HEALTH_NAME}</TabsTrigger>
            <TabsTrigger value="freshness">{process.env.NEXT_PUBLIC_TAB_FRESHNESS_NAME}</TabsTrigger>
          </TabsList>

          <TabsContent value="cortex-agent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{process.env.NEXT_PUBLIC_TAB_SNOWFLAKE_CORTEX_AGENT_TITLE}</CardTitle>
                <CardDescription>
                  {process.env.NEXT_PUBLIC_TAB_SNOWFLAKE_CORTEX_AGENT_DESCRIPTION}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CotexAgentChatBot />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{process.env.NEXT_PUBLIC_TAB_OPENMETADATA_SOLUTION_TITLE}</CardTitle>
                <CardDescription>
                  {process.env.NEXT_PUBLIC_TAB_OPENMETADATA_SOLUTION_DESCRIPTION}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {<iframe
                      title='OpenMetaData'
                      src={process.env.NEXT_PUBLIC_OPENMETADATA_BASE_URI}
                      width="100%"
                      height="800"
                      style={{ border: 'none' }}
                  />}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{process.env.NEXT_PUBLIC_TAB_OPENMETADATA_PIPELINE_HEALTH}</CardTitle>
                <CardDescription>
                  {process.env.NEXT_PUBLIC_TAB_OPENMETADATA_PIPELINE_HEALTH_DESCRIPTION}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pipeline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Tests</TableHead>
                      <TableHead>Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelines.map((pipeline) => (
                      <TableRow key={pipeline.id}>
                        <TableCell className="font-medium">{pipeline.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(pipeline.status)}
                            <Badge variant={pipeline.status === 'success' ? 'default' : 
                                           pipeline.status === 'failed' ? 'destructive' : 'secondary'}>
                              {pipeline.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{pipeline.lastRun}</TableCell>
                        <TableCell>{pipeline.duration}m</TableCell>
                        <TableCell>
                          <span className={pipeline.testsPass === pipeline.testsTotal ? 'text-green-600' : 'text-red-600'}>
                            {pipeline.testsPass}/{pipeline.testsTotal}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(pipeline.testsPass / pipeline.testsTotal) * 100} 
                              className="w-16"
                            />
                            <span className="text-sm">
                              {Math.round((pipeline.testsPass / pipeline.testsTotal) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="freshness" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{process.env.NEXT_PUBLIC_TAB_OPENMETADATA_FRESHNESS}</CardTitle>
                <CardDescription>
                  {process.env.NEXT_PUBLIC_TAB_OPENMETADATA_FRESHNESS_DESCRIPTION}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{CONSTANTS.FRESHNESS_HEADERS.TABLE}</TableHead>
                      <TableHead>{CONSTANTS.FRESHNESS_HEADERS.LAST_UPDATED}</TableHead>
                      <TableHead>{CONSTANTS.FRESHNESS_HEADERS.FRESHNESS_SCORE}</TableHead>
                      <TableHead>{CONSTANTS.FRESHNESS_HEADERS.STATUS}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freshness.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.table}</TableCell>
                        <TableCell>{item.lastUpdated}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.freshnessScore} className="w-20" />
                            <span className="text-sm">{item.freshnessScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getFreshnessColor(item.status)}`} />
                            <Badge variant={item.status === 'fresh' ? 'default' : 
                                           item.status === 'stale' ? 'secondary' : 'destructive'}>
                              {item.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
