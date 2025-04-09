import pandas as pd
from scipy.stats import f_oneway
from ingestion.models import StagingData  # Make sure this path is correct
from django.db import connection
from ingestion.models import StagingData

def create_dataframe():
    latest = StagingData.objects.latest('created_at')

    if latest.table_name:
        # ✅ Pull directly from PostgreSQL table
        with connection.cursor() as cursor:
            cursor.execute(f'SELECT * FROM "{latest.table_name}"')
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        df = pd.DataFrame(rows, columns=columns)
        return df

    # ✅ Otherwise fall back to JSON ingestion
    raw = latest.raw_data

    if isinstance(raw, dict):
        raw = raw.get("data", raw)

    if isinstance(raw, dict):
        raw = [raw]

    df = pd.DataFrame(raw)
    return df



# ✅ Prepare data for line chart (for frontend)
def plot_line_chart(df, field1, field2):
    try:
        return {
            "x": df[field2].astype(str).tolist(),
            "y": pd.to_numeric(df[field1], errors="coerce").fillna(0).tolist(),
            "title": f"Line Chart: {field1} vs {field2}",
            "type": "line"
        }
    except Exception as e:
        print(f"Line chart error for {field1} vs {field2}:", e)
        return {
            "x": [],
            "y": [],
            "title": f"Line Chart Failed for {field1} vs {field2}",
            "type": "line"
        }


# ✅ Prepare data for bar/column chart (for frontend)
def plot_column_chart(df, field1, field2):
    try:
        return {
            "x": df[field2].tolist(),
            "y": df[field1].tolist(),
            "title": f"Column Chart: {field1} vs {field2}",
            "type": "bar"
        }
    except Exception as e:
        print(f"Column chart error for {field1} vs {field2}:", e)
        return {
            "x": [],
            "y": [],
            "title": f"Column Chart Failed for {field1} vs {field2}",
            "type": "bar"
        }   

# ✅ Format outlier data for frontend
def plot_outlier_table(field1, outliers):
    return outliers.to_dict(orient='records')

# ✅ Correlation test to find best correlated numerical field
def correlation_test(df, field1, field2):
    columns_to_correlate = [
        col for col in df.columns if col != df.columns[0] and col != field1 and col != field2
    ]

    numerical_columns = df[columns_to_correlate].select_dtypes(include=['number']).columns

    target_cor = 0
    target_col = None

    for col in numerical_columns:
        try:
            correlation = df[field1].corr(df[col])
            if correlation > target_cor:
                target_cor = correlation
                target_col = col
        except Exception as e:
            print(f"Skipping {col}: {e}")
            continue

    print("DEBUG: Best correlation found with:", target_col)
    return target_col  # Can be None



# ✅ ANOVA test to find best correlated categorical field
def anova_test(df, field1, field2, field3):
    columns_to_correlate = [col for col in df.columns if col not in [df.columns[0], field1, field2, field3]]
    categorical_columns = df[columns_to_correlate].select_dtypes(include=['object', 'category']).columns

    target_cor = 1
    target_col = None
    warning = None

    for col in categorical_columns:
        if col == field1:
            continue

        groups = [df[field1][df[col] == category] for category in df[col].unique()]
        try:
            f_statistic, p_value = f_oneway(*groups)
        except:
            continue

        if p_value < target_cor:
            target_cor = p_value
            target_col = col

    if target_cor > 0.05:
        warning = f"{target_col or 'None'} and {field1} have the best relationship, but correlation is low."
    else:
        warning = ""

    return (target_col if target_col else field2, warning)

# ✅ IQR-based outlier detection
def detect_outliers(df, field1):
    Q1 = df[field1].quantile(0.25)
    Q3 = df[field1].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = df[(df[field1] < lower_bound) | (df[field1] > upper_bound)]
    return outliers


# ✅ Main callable function for backend view
def run_stats_module(field1, field2):
    df = create_dataframe()

    if df.empty:
        return {"error": "No data available to analyze."}
    
    print("DEBUG: DataFrame columns =", df.columns.tolist())

    if field1 not in df.columns or field2 not in df.columns:
        return {
        "error": "Selected fields do not exist in the dataset.",
        "available_fields": list(df.columns)
        }


    field3 = correlation_test(df, field1, field2)
    field4, warning = anova_test(df, field1, field2, field3)
    outliers = detect_outliers(df, field1)

    # ⛔ Only include line_chart_2 if it's NOT self-correlation
    charts = {
        "line_chart_1": plot_line_chart(df, field1, field2),
        "column_chart": plot_column_chart(df, field1, field4),
    }

    if field3 and field3 != field1:
        charts["line_chart_2"] = plot_line_chart(df, field1, field3)
    else:
        if not warning:
            warning = f"No strong correlation found for '{field1}'. Skipping secondary line chart."


    return {
        "charts": charts,
        "outliers": plot_outlier_table(field1, outliers),
        "warning": warning

    }