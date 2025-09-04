import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { marketAPI } from "../../services/api";

// Async thunks
export const fetchMarketData = createAsyncThunk(
  "market/fetchMarketData",
  async ({ symbol, timeframe = "1d", limit = 100 }, { rejectWithValue }) => {
    try {
      const response = await marketAPI.getOHLCVData(symbol, timeframe, limit);
      return { symbol, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch market data"
      );
    }
  }
);

export const fetchTechnicalIndicators = createAsyncThunk(
  "market/fetchTechnicalIndicators",
  async ({ symbol, indicators }, { rejectWithValue }) => {
    try {
      const response = await marketAPI.getTechnicalIndicators(
        symbol,
        indicators
      );
      return { symbol, indicators: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch technical indicators"
      );
    }
  }
);

export const fetchOnChainMetrics = createAsyncThunk(
  "market/fetchOnChainMetrics",
  async ({ symbol }, { rejectWithValue }) => {
    try {
      const response = await marketAPI.getOnChainMetrics(symbol);
      return { symbol, metrics: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch on-chain metrics"
      );
    }
  }
);

export const fetchMarketSentiment = createAsyncThunk(
  "market/fetchMarketSentiment",
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketAPI.getMarketSentiment();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch market sentiment"
      );
    }
  }
);

const initialState = {
  currentSymbol: "BTC",
  timeframe: "1d",
  ohlcvData: {},
  technicalIndicators: {},
  onChainMetrics: {},
  marketSentiment: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  realTimePrice: null,
  priceChange24h: null,
  prices: {},
  currency: "INR",
  conversionRate: 83.0,
};

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    setCurrentSymbol: (state, action) => {
      state.currentSymbol = action.payload;
    },
    setTimeframe: (state, action) => {
      state.timeframe = action.payload;
    },
    updateRealTimePrice: (state, action) => {
      state.realTimePrice = action.payload.price;
      state.priceChange24h = action.payload.change24h;
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setConversionRate: (state, action) => {
      state.conversionRate = action.payload;
    },
    updatePrices: (state, action) => {
      state.prices = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch market data
      .addCase(fetchMarketData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ohlcvData[action.payload.symbol] = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch technical indicators
      .addCase(fetchTechnicalIndicators.fulfilled, (state, action) => {
        state.technicalIndicators[action.payload.symbol] =
          action.payload.indicators;
      })
      // Fetch on-chain metrics
      .addCase(fetchOnChainMetrics.fulfilled, (state, action) => {
        state.onChainMetrics[action.payload.symbol] = action.payload.metrics;
      })
      // Fetch market sentiment
      .addCase(fetchMarketSentiment.fulfilled, (state, action) => {
        state.marketSentiment = action.payload;
      });
  },
});

export const {
  setCurrentSymbol,
  setTimeframe,
  updateRealTimePrice,
  clearError,
  setCurrency,
  setConversionRate,
  updatePrices,
} = marketSlice.actions;

export default marketSlice.reducer;
