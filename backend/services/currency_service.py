import aiohttp
from typing import Dict, Optional
from cachetools import TTLCache
import logging

class CurrencyService:
    def __init__(self):
        self.cache = TTLCache(maxsize=100, ttl=3600)  # Cache for 1 hour
        self.logger = logging.getLogger(__name__)
        self.base_url = "https://api.exchangerate-api.com/v4/latest/USD"

    async def get_usd_to_inr_rate(self) -> float:
        if "USD_INR" in self.cache:
            return self.cache["USD_INR"]

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url) as response:
                    data = await response.json()
                    rate = data["rates"]["INR"]
                    self.cache["USD_INR"] = rate
                    return rate
        except Exception as e:
            self.logger.error(f"Currency conversion error: {str(e)}")
            return 83.0  # Fallback rate if API fails

    async def convert_usd_to_inr(self, usd_amount: float) -> Dict[str, float]:
        rate = await self.get_usd_to_inr_rate()
        inr_amount = usd_amount * rate
        return {
            "USD": usd_amount,
            "INR": round(inr_amount, 2),
            "rate": rate
        }