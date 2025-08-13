# A comprehensive Next.js admin portal for data pipeline monitoring with OpenMetadata integration. This will include a scan trigger, health monitoring and real-time status updates.

## Core Features

**One-Click Experience:**

- **Scan Now Button**: Triggers OpenMetadata REST API or MWAA DAG ingestion
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Toast Notifications**: Immediate feedback on scan operations

**Pipeline Health Monitoring:**

1. **Test Pass/Fail Status**: Great Expectations results with visual indicators
2. **Data Freshness**: OpenMetadata profiler metrics with freshness scores
3. **Last Ingest Timestamp**: Real-time pipeline execution tracking
4. **Lineage Changes**: Git Data Lineage tracking for DAG modifications
5. **❄️ Snowflake Cortex Agent - BI**: Cortex Agents simplify AI-powered data interactions via a REST API, combining hybrid search and accurate SQL generation. They streamline workflows by managing context retrieval, natural language to SQL conversion, and LLM orchestration. Response quality is enhanced with in-line citations, answer abstention, and multi-message context handling. Developers benefit from a single API call integration, real-time streamed responses, and reduced latency for optimized applications.

## UI Components

- **Overview Dashboard**: Health metrics, active pipelines, and recent changes
- **Tabbed Interface**: Organized views for different monitoring aspects
- **Progress Bars**: Visual representation of test success rates and freshness
- **Status Badges**: Color-coded indicators for quick status identification
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Technical Implementation

- **Mock API Routes**: Simulates OpenMetadata and MWAA integrations
- **TypeScript**: Full type safety for data structures
- **Real-time Updates**: Automatic data refresh with loading states
- **Error Handling**: Comprehensive error management with user feedback

### The portal provides a professional, enterprise-grade interface for monitoring data pipeline health with all the requested functionality integrated into a single, intuitive dashboard.
