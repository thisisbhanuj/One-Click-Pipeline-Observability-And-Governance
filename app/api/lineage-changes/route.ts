import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate git diff results for lineage DAG changes
  const mockChanges = [
    {
      id: '1',
      type: 'modified',
      entity: 'customer_pipeline.py',
      timestamp: '2 hours ago',
      author: 'john.doe'
    },
    {
      id: '2',
      type: 'added',
      entity: 'new_analytics_dag.py',
      timestamp: '4 hours ago',
      author: 'jane.smith'
    },
    {
      id: '3',
      type: 'removed',
      entity: 'deprecated_etl.py',
      timestamp: '6 hours ago',
      author: 'mike.johnson'
    },
    {
      id: '4',
      type: 'modified',
      entity: 'sales_pipeline.py',
      timestamp: '8 hours ago',
      author: 'sarah.wilson'
    },
    {
      id: '5',
      type: 'added',
      entity: 'inventory_sync.py',
      timestamp: '12 hours ago',
      author: 'alex.brown'
    }
  ]

  return NextResponse.json(mockChanges)
}
