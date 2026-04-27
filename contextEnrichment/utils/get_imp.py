import holidays
from datetime import datetime


def get_con(ts_str: str):
    """
    Parse a timestamp string and return contextual day/holiday information.
    Handles ISO 8601 with or without timezone offset.
    """
    if not ts_str:
        dt = datetime.utcnow()
    else:
        try:
            dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            dt = datetime.utcnow()

    formatted_date = dt.strftime("%Y-%m-%d")
    de_holidays = holidays.Germany(prov="BW")

    # FIX: is_holiday was used before being defined (NameError at runtime)
    is_holiday = formatted_date in de_holidays

    return {
        "day": dt.strftime("%A"),
        "year": dt.year,
        "is_holiday": is_holiday,
        "holiday_name": de_holidays.get(formatted_date, "Regular Day"),
        "is_weekend": dt.weekday() >= 5,
    }
    
    
