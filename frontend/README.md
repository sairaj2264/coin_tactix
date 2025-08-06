# CoinTactix - Advanced Cryptocurrency Trading Intelligence

A sophisticated cryptocurrency trading application with AI-powered predictions, strategy backtesting, and real-time market analysis.

## 🚀 Features

### Phase 1 - Completed ✅
- **Modern React Frontend**: Built with Vite, React 18, and Redux Toolkit
- **Responsive Design**: Mobile-first design with custom CSS utilities
- **Authentication System**: Login/Register pages with form validation
- **Dashboard**: Interactive dashboard with real-time price displays
- **Navigation**: Sidebar navigation with route protection
- **Component Architecture**: Modular component structure for scalability

### Planned Features
- **AI-Powered Predictions**: LSTM and XGBoost models for price forecasting
- **Strategy Engine**: Create and manage custom trading strategies
- **Backtesting Simulator**: Test strategies against historical data
- **Real-time Alerts**: Custom notifications for price movements
- **Portfolio Tracking**: Monitor your cryptocurrency investments
- **On-chain Analytics**: MVRV, SOPR, Puell Multiple metrics
- **Market Sentiment**: Fear & Greed Index and news sentiment analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management with RTK Query
- **React Router** - Client-side routing
- **Chart.js** - Interactive charts and data visualization
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time WebSocket communication
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server

### Planned Backend
- **Python Flask/FastAPI** - RESTful API server
- **PostgreSQL + TimescaleDB** - Time-series database for market data
- **Redis** - Caching and session management
- **Socket.io** - Real-time WebSocket server
- **Celery** - Background task processing
- **Docker** - Containerization

### Machine Learning
- **TensorFlow/Keras** - LSTM neural networks
- **XGBoost** - Gradient boosting for external factors
- **Pandas/NumPy** - Data processing and analysis
- **TA-Lib** - Technical analysis indicators

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout/       # Layout components (Header, Sidebar)
│   │   ├── Charts/       # Chart components
│   │   └── Dashboard/    # Dashboard-specific components
│   ├── pages/            # Page components
│   │   ├── Auth/         # Authentication pages
│   │   └── ...           # Other pages
│   ├── store/            # Redux store and slices
│   │   └── slices/       # Redux slices for different features
│   ├── services/         # API services and utilities
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Application entry point
│   └── style.css         # Global styles
├── .env                  # Environment variables
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coin-tactix/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000

# Application Configuration
VITE_APP_NAME=CoinTactix
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## 📱 Pages & Features

### Authentication
- **Login Page**: Email/password authentication with validation
- **Register Page**: User registration with form validation
- **Protected Routes**: Automatic redirection for unauthenticated users

### Dashboard
- **Real-time Price Display**: Live cryptocurrency prices
- **Market Overview**: Multiple cryptocurrency tracking
- **Performance Metrics**: Portfolio value, P&L, win rate
- **Interactive Charts**: Price charts with technical indicators
- **Recent Activity**: Alerts and notifications feed

### Strategy Engine
- **Strategy Creation**: Build custom trading strategies
- **AI Predictions**: Get AI-powered price forecasts
- **Risk Assessment**: Confidence scores and risk metrics

### Backtesting
- **Historical Testing**: Test strategies against past data
- **Performance Analytics**: Detailed metrics and visualizations
- **Risk Analysis**: Drawdown, Sharpe ratio, and other metrics

## 🎨 Design System

The application uses a custom design system with:
- **Color Palette**: Primary blues, success greens, danger reds
- **Typography**: Inter font family with multiple weights
- **Components**: Consistent button, card, and input styles
- **Responsive Design**: Mobile-first approach with breakpoints

## 🔮 Roadmap

### Phase 2: Backend & ML Development
- [ ] Flask/FastAPI backend setup
- [ ] PostgreSQL database with TimescaleDB
- [ ] API integration (CoinGecko, Trading Economics)
- [ ] LSTM and XGBoost model development
- [ ] Feature engineering pipeline

### Phase 3: Advanced Features
- [ ] Real-time WebSocket implementation
- [ ] Advanced charting with technical indicators
- [ ] Strategy backtesting engine
- [ ] Alert system with notifications
- [ ] Portfolio management

### Phase 4: Production & Deployment
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Security implementation
- [ ] Performance optimization
- [ ] Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- CoinGecko API for cryptocurrency data
- Trading Economics for macro economic data
- TradingView for charting inspiration
- The React and open-source community
