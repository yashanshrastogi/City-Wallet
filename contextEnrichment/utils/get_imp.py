import holidays
from datetime import datetime
def get_con(ts_str: str):
    dt=datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
    formatted_date = dt.strftime('%Y-%m-%d')
    de_holidays = holidays.Germany(prov='BW')
    return {
        "day": dt.strftime('%A'),
        "year": dt.year,
        "is_holiday": is_holiday,
        "holiday_name": de_holidays.get(formatted_date) if is_holiday else "Regular Day",
        "is_weekend": dt.weekday() >= 5
    }
    
    
