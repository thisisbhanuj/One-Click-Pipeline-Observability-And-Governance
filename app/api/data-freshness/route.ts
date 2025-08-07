import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate OpenMetadata profiler metrics
  const mockFreshness = [
    {
      table: 'customers',
      lastUpdated: '5 minutes ago',
      freshnessScore: 95,
      status: 'fresh'
    },
    {
      table: 'orders',
      lastUpdated: '2 hours ago',
      freshnessScore: 78,
      status: 'stale'
    },
    {
      table: 'products',
      lastUpdated: '15 minutes ago',
      freshnessScore: 88,
      status: 'fresh'
    },
    {
      table: 'user_sessions',
      lastUpdated: '6 hours ago',
      freshnessScore: 45,
      status: 'critical'
    },
    {
      table: 'inventory',
      lastUpdated: '1 hour ago',
      freshnessScore: 82,
      status: 'fresh'
    },
    {
      table: 'analytics_events',
      lastUpdated: '4 hours ago',
      freshnessScore: 62,
      status: 'stale'
    }
  ]

  return NextResponse.json(mockFreshness)
}
