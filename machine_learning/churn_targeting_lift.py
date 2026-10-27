"""
Évaluation orientée métier du modèle Random Forest :
quelle part des clients qui partent (churners) capte-t-on en ciblant
les X % de clients au score de risque le plus élevé ?

Reprend exactement la préparation et les paramètres du notebook
analyse/02_modeling_churn_prediction.ipynb (même découpage, même SMOTE).

Usage : python machine_learning/churn_targeting_lift.py [data/cleaned_dataset.csv]
"""
import sys

import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def main(path):
    df = pd.read_csv(path)
    X = df.drop(columns=["customerID", "Churn", "ChurnBinary"])
    y = df["ChurnBinary"]
    num_cols = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]
    cat_cols = [c for c in X.columns if c not in num_cols]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ])
    model = ImbPipeline([
        ("preprocessor", preprocessor),
        ("smote", SMOTE(random_state=42)),  # appliqué uniquement sur le jeu d'entraînement
        ("model", RandomForestClassifier(n_estimators=350, max_depth=9, min_samples_leaf=8,
                                         random_state=42, n_jobs=1)),
    ])
    model.fit(X_train, y_train)

    proba = model.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)
    print(f"ROC-AUC : {roc_auc_score(y_test, proba):.3f} | rappel : {recall_score(y_test, pred):.1%} "
          f"| précision : {precision_score(y_test, pred):.1%}\n")

    order = np.argsort(-proba)
    y_sorted = y_test.values[order]
    total_churners = y_sorted.sum()

    print("| Clients ciblés (score le plus élevé) | Part des départs captés | Taux de churn dans le groupe | Lift |")
    print("|---|---|---|---|")
    for share in (0.10, 0.20, 0.30, 0.40):
        k = int(round(share * len(y_sorted)))
        captured = y_sorted[:k].sum() / total_churners
        print(f"| {share:.0%} | {captured:.0%} | {y_sorted[:k].mean():.0%} | {captured / share:.1f} |")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data/cleaned_dataset.csv")
