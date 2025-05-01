import re

def clean_column_name(col: str) -> str:
    # Lowercase, replace % with 'percent', non-word to underscore, collapse underscores
    s = col.lower().replace('%', 'percent')
    s = re.sub(r"[^\w]+", '_', s)
    s = re.sub(r"_+", '_', s).strip('_')
    return s 