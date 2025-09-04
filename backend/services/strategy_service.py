from typing import Dict, List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from dataclasses import dataclass

@dataclass
class StrategyConfig:
    timeframe: str
    risk_level: str
    initial_capital: float
    target_return: float
    stop_loss: float
    max_position_size: float

class StrategyService:
    def __init__(self, market_service, ai_service):
        self.market_service = market_service
        self.ai_service = ai_service
        
    async def create_yearly_strategy(self, symbol: str, config: StrategyConfig) -> Dict:
        # Get historical data for analysis
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365*2)  # 2 years for training
        historical_data = await self.market_service.get_historical_data(
            symbol, start_date, end_date, config.timeframe
        )
        
        # Create quarterly checkpoints
        quarters = self._create_quarterly_checkpoints(config)
        
        # Generate AI predictions for each quarter
        predictions = await self._generate_quarterly_predictions(symbol, quarters)
        
        return {
            "strategy_id": str(uuid.uuid4()),
            "symbol": symbol,
            "config": config.__dict__,
            "quarterly_targets": quarters,
            "predictions": predictions,
            "review_dates": self._generate_review_dates(),
            "risk_adjustments": self._calculate_risk_adjustments(config),
            "position_sizing": self._calculate_position_sizes(config)
        }
    
    def _create_quarterly_checkpoints(self, config: StrategyConfig) -> List[Dict]:
        initial_capital = config.initial_capital
        quarterly_return = (1 + config.target_return) ** (1/4) - 1
        
        quarters = []
        for i in range(4):
            target_capital = initial_capital * (1 + quarterly_return)
            quarters.append({
                "quarter": i + 1,
                "start_capital": initial_capital,
                "target_capital": target_capital,
                "min_acceptable": initial_capital * (1 - config.stop_loss),
                "max_risk": initial_capital * 0.02  # 2% risk per trade
            })
            initial_capital = target_capital
            
        return quarters