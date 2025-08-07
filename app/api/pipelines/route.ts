import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate OpenMetadata API call
  const mockPipelines = [
    {
      id: '1',
      name: 'Customer Data Ingestion',
      status: 'success',
      lastRun: '2 minutes ago',
      duration: 15,
      testsPass: 12,
      testsTotal: 12
    },
    {
      id: '2',
      name: 'Product Catalog Sync',
      status: 'running',
      lastRun: '5 minutes ago',
      duration: 8,
      testsPass: 8,
      testsTotal: 10
    },
    {
      id: '3',
      name: 'Sales Analytics ETL',
      status: 'failed',
      lastRun: '1 hour ago',
      duration: 22,
      testsPass: 5,
      testsTotal: 8
    },
    {
      id: '4',
      name: 'User Behavior Tracking',
      status: 'success',
      lastRun: '30 minutes ago',
      duration: 12,
      testsPass: 15,
      testsTotal: 15
    },
    {
      id: '5',
      name: 'Inventory Management',
      status: 'idle',
      lastRun: '2 hours ago',
      duration: 18,
      testsPass: 6,
      testsTotal: 7
    }
  ]

  return NextResponse.json(mockPipelines)
}
