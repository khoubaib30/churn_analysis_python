from pathlib import Path
from typing import Literal
import json

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "machine_learning" / "models" / "random_forest_churn_model.pkl"
METRICS_PATH = ROOT / "machine_learning" / "model_metrics.json"

app = FastAPI(title="Customer Churn Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/analysis-figures",
    StaticFiles(directory=ROOT / "visualisation" / "figures"),
    name="analysis-figures",
)
app.mount(
    "/ml-figures",
    StaticFiles(directory=ROOT / "machine_learning" / "figures"),
    name="ml-figures",
)


class CustomerInput(BaseModel):
    gender: Literal["Female", "Male"] = "Female"
    SeniorCitizen: Literal[0, 1] = 0
    Partner: Literal["Yes", "No"] = "No"
    Dependents: Literal["Yes", "No"] = "No"
    tenure: int = Field(1, ge=0, le=72)
    PhoneService: Literal["Yes", "No"] = "Yes"
    MultipleLines: Literal["No", "Yes", "No phone service"] = "No"
    InternetService: Literal["DSL", "Fiber optic", "No"] = "Fiber optic"
    OnlineSecurity: Literal["No", "Yes", "No internet service"] = "No"
    OnlineBackup: Literal["No", "Yes", "No internet service"] = "No"
    DeviceProtection: Literal["No", "Yes", "No internet service"] = "No"
    TechSupport: Literal["No", "Yes", "No internet service"] = "No"
    StreamingTV: Literal["No", "Yes", "No internet service"] = "No"
    StreamingMovies: Literal["No", "Yes", "No internet service"] = "No"
    Contract: Literal["Month-to-month", "One year", "Two year"] = "Month-to-month"
    PaperlessBilling: Literal["Yes", "No"] = "Yes"
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ] = "Electronic check"
    MonthlyCharges: float = Field(70.0, ge=0)
    TotalCharges: float = Field(70.0, ge=0)


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("Model file not found. Run the modeling notebook first.")
    return joblib.load(MODEL_PATH)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Customer churn API is running"}


@app.get("/metrics")
def metrics():
    if not METRICS_PATH.exists():
        return {"message": "Metrics file not found yet."}
    with open(METRICS_PATH, encoding="utf-8") as f:
        return json.load(f)


@app.post("/predict")
def predict(customer: CustomerInput):
    model = load_model()
    row = pd.DataFrame([customer.model_dump()])
    proba = float(model.predict_proba(row)[0][1])
    prediction = "Yes" if proba >= 0.5 else "No"

    if proba >= 0.70:
        risk = "High"
    elif proba >= 0.40:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "prediction": prediction,
        "churn_probability": round(proba, 4),
        "risk_level": risk,
    }
