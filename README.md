# Xandeum pNodes Analytics → The dashboard operators actually want

[![Live Demo](https://img.shields.io/badge/Live_Demo-8b5cf6?style=for-the-badge&logo=vercel)](https://xandeum-pnodes-analytics.vercel.app)

**Real-time pRPC • Geographic map • Network health • Built for Xandeum Bounty – Dec 2025**

A modern, web-based analytics platform for Xandeum Provider Nodes (pNodes), providing real-time insights into the Xandeum storage network.

## Latest Features (Dec 2025)

### Core Tabs & Navigation
- 📊 **8 Comprehensive Tabs**: Overview, Nodes, Analytics, Compare, Performance, Network, Reports, and Alerts
- 🎨 **Professional UI**: Enterprise-grade sidebar/topbar layout with accessible design
- 🌓 **Theme Toggle**: Light/dark mode with persistent preferences
- 🔍 **Smart Search**: Global search with keyboard shortcut (/) and real-time filtering

### Analytics & Monitoring
- 📈 **Performance Tab**: Leaderboard with sorting by Health, Uptime, Storage, and Latency
- 🌐 **Network Tab**: Geographic heatmap with Count/Storage/Latency views, network topology, and statistics
- 📋 **Reports Tab**: Generate Network Summary, Performance, and Network Health reports (JSON export)
- 🔔 **Alerts Tab**: Active alerts monitoring, threshold configuration, and notification settings

### Advanced Features
- 💰 **XAND Rewards Estimation**: Calculate estimated monthly rewards based on storage, uptime, and latency
- 🗺️ **Real IP-to-Location Mapping**: Geographic distribution using IP-API.com
- ⏱️ **Consensus Metrics**: Last vote/block timestamps and blocks behind tracking
- 📊 **Network Health Score**: Overall network health indicator (0-100)
- 📤 **Export Functionality**: CSV and JSON export options for all node data
- 🔄 **Date Range Selection**: Filter data by time periods (1h, 24h, 7d, 30d, 90d, All time)
- 🎯 **Advanced Filtering**: Multi-criteria filters (status, uptime, latency, storage, location)
- 🔔 **Notifications Panel**: Alert management with read/unread status
- ⚙️ **Settings Panel**: Appearance, data refresh, and export management

## Features

### Core Functionality
- 🔍 **Real-time pNode Discovery**: Retrieves all pNodes from Xandeum network gossip using pRPC calls
- 📊 **Comprehensive Analytics**: View detailed statistics including storage capacity, uptime, latency, and more
- 🔄 **Auto-refresh**: Automatically updates every 30 seconds
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Advanced Visualizations
- 🏆 **Performance Leaderboard**: Top 10 nodes ranked by health, uptime, storage, or latency
- 🔄 **Node Comparison Tool**: Compare up to 4 nodes side-by-side with visual indicators
- 🗺️ **Geographic Heatmap**: Visual distribution by location with multiple metric views
- 📈 **Network Topology**: Interactive flow diagram showing node connections
- 📊 **Activity Timeline**: Chronological feed of network changes
- 💡 **AI-Powered Insights**: Automatic health issue detection and recommendations
- 📉 **Sparklines**: Quick trend visualization in all stat cards

### User Experience
- 🎨 **Modern UI**: Professional, enterprise-grade card layout with sidebar/topbar navigation
- 🔎 **Advanced Search & Filter**: Multi-criteria filtering with real-time results
- 📈 **Multiple View Modes**: Grid, Table, and Analytics views
- 🎯 **Detailed Node Modal**: Comprehensive node information with historical trends
- 💾 **Export Functionality**: Export data to CSV or JSON with multiple report types
- 📊 **Network Health Score**: Overall network health indicator (0-100)
- 🎛️ **8 Comprehensive Tabs**: Overview, Nodes, Analytics, Compare, Performance, Network, Reports, Alerts
- 🌓 **Theme Support**: Light/dark mode with system preference detection

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Access to Xandeum pRPC endpoints (or use mock data for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd XandeumpNodes
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure pRPC endpoint (optional):
   - The default pRPC endpoint is set to `https://api.xandeum.network`
   - To change it, edit `lib/prpc.ts` and update the `baseUrl` in the `PRPCClient` constructor
   - If the endpoint is not available, the app will automatically use mock data for development

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Configuration

### pRPC Endpoint

The pRPC client is configured in `lib/prpc.ts`. To use a different endpoint:

```typescript
export const prpcClient = new PRPCClient('https://your-prpc-endpoint.com');
```

### API Methods

The platform uses the following pRPC methods (as defined in `lib/prpc.ts`):

- `getGossipNodes()`: Retrieves all pNodes from network gossip
- `getNodeInfo(address)`: Gets detailed information about a specific pNode

**Note**: The exact pRPC method names and parameters may need to be adjusted based on the official Xandeum pRPC API documentation. The current implementation follows common RPC patterns and includes fallback mock data for development.

## Project Structure

```
XandeumpNodes/
├── app/
│   ├── api/
│   │   └── pnodes/
│   │       └── route.ts          # API route for fetching pNodes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── PNodeCard.tsx             # Card component for grid view
│   └── PNodeTable.tsx            # Table component for table view
├── lib/
│   └── prpc.ts                   # pRPC client and types
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Features in Detail

### Dashboard Overview

- **Total pNodes**: Count of all discovered pNodes
- **Online Nodes**: Number of nodes currently online
- **Syncing Nodes**: Nodes currently syncing
- **Total Storage**: Aggregate storage capacity across all nodes

### Node Information

Each pNode displays:
- Node ID and address
- Status (online/offline/syncing)
- Software version
- Storage capacity and usage
- Uptime
- Geographic location (if available)
- Network latency

### Search & Filter

- Search by node ID, address, or public key
- Filter by status (all/online/syncing/offline)
- Sort by any column in table view

### View Modes

- **Grid View**: Card-based layout for visual browsing
- **Table View**: Detailed tabular data with sorting capabilities

## Development

### Adding New Features

1. **New Metrics**: Add fields to the `PNode` interface in `lib/prpc.ts`
2. **New Views**: Create new components in the `components/` directory
3. **API Endpoints**: Add new routes in `app/api/`

### Mock Data

The platform includes mock data for development when the pRPC endpoint is unavailable. To disable mock data, remove the fallback in `lib/prpc.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### pRPC Connection Issues

If you're unable to connect to the pRPC endpoint:
- Verify the endpoint URL is correct
- Check network connectivity
- The app will automatically use mock data for development
- Join the [Xandeum Discord](https://discord.gg/uqRSmmM5m) for support

### Build Errors

- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## Resources

- [Xandeum Network](https://xandeum.network)
- [Xandeum Documentation](https://docs.xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Next.js Documentation](https://nextjs.org/docs)

## License

This project is open source and available for the Xandeum challenge submission.

## Submission Notes

This platform was developed for the Xandeum Labs pNode Analytics Challenge. It demonstrates:

- ✅ **Successful pRPC Integration**: Real-time pNode data retrieval from Xandeum network gossip
- ✅ **Professional UI/UX**: Enterprise-grade interface with 8 comprehensive tabs and intuitive navigation
- ✅ **Advanced Features**: XAND rewards estimation, consensus metrics, geographic mapping, network health monitoring
- ✅ **Comprehensive Analytics**: Performance leaderboards, network topology, reports generation, and alerts system
- ✅ **Production-Ready**: Proper error handling, responsive design, theme support, and export functionality
- ✅ **Real-time Updates**: Auto-refresh every 30 seconds with historical data tracking

**Live Demo**: [xandeum-pnodes-analytics.vercel.app](https://xandeum-pnodes-analytics.vercel.app)  
**GitHub**: [github.com/panagot/xandeum-pnodes-analytics](https://github.com/panagot/xandeum-pnodes-analytics)

For questions or support, please reach out via the [Xandeum Discord](https://discord.gg/uqRSmmM5m) community.

