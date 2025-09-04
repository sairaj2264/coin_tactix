import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { strategyAPI } from "../../services/api";

// Async thunks
export const fetchStrategies = createAsyncThunk(
  "strategy/fetchStrategies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await strategyAPI.getStrategies();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch strategies"
      );
    }
  }
);

export const createStrategy = createAsyncThunk(
  "strategy/createStrategy",
  async (strategyData, { rejectWithValue }) => {
    try {
      const response = await strategyAPI.createStrategy(strategyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create strategy"
      );
    }
  }
);

export const updateStrategy = createAsyncThunk(
  "strategy/updateStrategy",
  async ({ id, strategyData }, { rejectWithValue }) => {
    try {
      const response = await strategyAPI.updateStrategy(id, strategyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update strategy"
      );
    }
  }
);

export const deleteStrategy = createAsyncThunk(
  "strategy/deleteStrategy",
  async (id, { rejectWithValue }) => {
    try {
      await strategyAPI.deleteStrategy(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete strategy"
      );
    }
  }
);

export const runBacktest = createAsyncThunk(
  "strategy/runBacktest",
  async ({ strategyId, backtestParams }, { rejectWithValue }) => {
    try {
      const response = await strategyAPI.runBacktest(
        strategyId,
        backtestParams
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to run backtest"
      );
    }
  }
);

export const getPrediction = createAsyncThunk(
  "strategy/getPrediction",
  async ({ symbol, timeframe, investmentAmount }, { rejectWithValue }) => {
    try {
      const response = await strategyAPI.getPrediction(
        symbol,
        timeframe,
        investmentAmount
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get prediction"
      );
    }
  }
);

export const createYearlyStrategy = createAsyncThunk(
  "strategy/createYearly",
  async ({ symbol, config }) => {
    const response = await strategyAPI.post("/strategy/yearly", {
      symbol,
      config,
    });
    return response.data;
  }
);

const initialState = {
  strategies: [],
  currentStrategy: null,
  backtestResults: null,
  prediction: null,
  isLoading: false,
  isBacktesting: false,
  isPredicting: false,
  error: null,
  selectedStrategyId: null,
  yearlyStrategies: [],
  activeStrategy: null,
  loading: false,
};

const strategySlice = createSlice({
  name: "strategy",
  initialState,
  reducers: {
    setCurrentStrategy: (state, action) => {
      state.currentStrategy = action.payload;
      state.selectedStrategyId = action.payload?.id || null;
    },
    clearBacktestResults: (state) => {
      state.backtestResults = null;
    },
    clearPrediction: (state) => {
      state.prediction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch strategies
      .addCase(fetchStrategies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStrategies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.strategies = action.payload;
      })
      .addCase(fetchStrategies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create strategy
      .addCase(createStrategy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStrategy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.strategies.push(action.payload);
        state.currentStrategy = action.payload;
      })
      .addCase(createStrategy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update strategy
      .addCase(updateStrategy.fulfilled, (state, action) => {
        const index = state.strategies.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.strategies[index] = action.payload;
        }
        if (state.currentStrategy?.id === action.payload.id) {
          state.currentStrategy = action.payload;
        }
      })
      // Delete strategy
      .addCase(deleteStrategy.fulfilled, (state, action) => {
        state.strategies = state.strategies.filter(
          (s) => s.id !== action.payload
        );
        if (state.currentStrategy?.id === action.payload) {
          state.currentStrategy = null;
          state.selectedStrategyId = null;
        }
      })
      // Run backtest
      .addCase(runBacktest.pending, (state) => {
        state.isBacktesting = true;
        state.error = null;
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.isBacktesting = false;
        state.backtestResults = action.payload;
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.isBacktesting = false;
        state.error = action.payload;
      })
      // Get prediction
      .addCase(getPrediction.pending, (state) => {
        state.isPredicting = true;
        state.error = null;
      })
      .addCase(getPrediction.fulfilled, (state, action) => {
        state.isPredicting = false;
        state.prediction = action.payload;
      })
      .addCase(getPrediction.rejected, (state, action) => {
        state.isPredicting = false;
        state.error = action.payload;
      })
      // Create yearly strategy
      .addCase(createYearlyStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createYearlyStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.yearlyStrategies.push(action.payload);
        state.activeStrategy = action.payload;
      })
      .addCase(createYearlyStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setCurrentStrategy,
  clearBacktestResults,
  clearPrediction,
  clearError,
} = strategySlice.actions;

export default strategySlice.reducer;
