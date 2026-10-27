# Customer Churn Prediction Project

Projet complet d'analyse du churn client avec :

- nettoyage et analyse exploratoire des donnees
- visualisations metier
- modelisation machine learning
- API locale avec FastAPI
- interface web locale avec React

## Problème et résultats

**Objectif :** identifier les clients d'un opérateur télécom qui risquent de résilier leur abonnement, pour prioriser les actions de rétention.

**Données :** dataset public [IBM Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) : 7 043 clients, 21 variables (contrat, ancienneté, services, facturation), 26,5 % de churn.

**Principaux constats de l'analyse exploratoire :**

- 43 % de churn sur les contrats mensuels, contre 11 % sur un an et 3 % sur deux ans ;
- le risque est le plus élevé la première année d'ancienneté (47 % de churn).

**Modèles** (découpage 80/20 stratifié, SMOTE appliqué uniquement au jeu d'entraînement, dans le pipeline) :

| Modèle | ROC-AUC | Rappel | Précision | F1 |
|---|---|---|---|---|
| Régression logistique (interprétation des facteurs) | 0,84 | 79 % | 50 % | 0,62 |
| **Random Forest (modèle retenu)** | **0,84** | **72 %** | **54 %** | **0,62** |

La Random Forest est retenue pour sa meilleure précision (moins de fausses alertes pour l'équipe rétention) ; la régression logistique sert à expliquer les facteurs de départ.

**Impact métier : ciblage des clients à risque**

En classant les clients du jeu de test selon le score de risque du modèle :

| Clients ciblés (score le plus élevé) | Part des départs captés | Taux de churn dans le groupe |
|---|---|---|
| 10 % | 28 % | 74 % |
| **20 %** | **51 %** | **67 %** |
| 30 % | 64 % | 56 % |

**En ciblant seulement 20 % des clients, on touche la moitié des départs**, soit environ 2,5 fois mieux qu'un ciblage au hasard.

Pour reproduire ce calcul :

```bash
python machine_learning/churn_targeting_lift.py
```

## Structure du projet

```text
churn_analysis_python/
├── analyse/
│   ├── 01_data_cleaning_eda.ipynb
│   └── 02_modeling_churn_prediction.ipynb
├── backend/
│   └── main.py
├── data/
│   └── cleaned_dataset.csv
├── frontend/
│   ├── src/
│   └── package.json
├── machine_learning/
│   ├── figures/
│   ├── models/
│   ├── churn_targeting_lift.py
│   ├── logistic_regression_coefficients.csv
│   └── random_forest_feature_importance.csv
├── visualisation/
│   ├── 01_visualisations_churn.ipynb
│   └── figures/
├── dataset.csv
└── requirements.txt
```

## Prerequis

Avant de commencer, verifier que vous avez installe :

- Python 3.10 ou plus recent
- Node.js 18 ou plus recent
- npm

## 1. Installer les dependances Python

Depuis la racine du projet :

```powershell
cd churn_analysis_python
pip install -r requirements.txt
```

## 2. Installer les dependances frontend

```powershell
cd churn_analysis_python/frontend
npm install
```

## 3. Ouvrir Jupyter pour executer les notebooks

Depuis la racine du projet :

```powershell
cd churn_analysis_python
jupyter notebook
```

Vous pouvez aussi utiliser :

```powershell
jupyter lab
```

## 4. Ordre d'execution des notebooks

Si vous voulez regenerer tout le projet proprement, executez les notebooks dans cet ordre :

### Etape 1 - Nettoyage et analyse exploratoire

Notebook :

```text
analyse/01_data_cleaning_eda.ipynb
```

Ce notebook :

- charge `dataset.csv`
- inspecte les types et la qualite des donnees
- corrige `TotalCharges`
- cree `ChurnBinary`
- sauvegarde le fichier nettoye dans `data/cleaned_dataset.csv`
- produit les premiers constats exploratoires

### Etape 2 - Entrainement des modeles

Notebook :

```text
analyse/02_modeling_churn_prediction.ipynb
```

Ce notebook :

- charge `data/cleaned_dataset.csv`
- prepare les donnees pour le machine learning
- applique le reequilibrage avec SMOTE
- entraine :
  - Logistic Regression
  - Random Forest
- compare les performances
- sauvegarde les resultats machine learning dans `machine_learning/`

Fichiers generes ou mis a jour :

- `machine_learning/models/random_forest_churn_model.pkl`
- `machine_learning/models/logistic_regression_churn_model.pkl`
- `machine_learning/random_forest_feature_importance.csv`
- `machine_learning/logistic_regression_coefficients.csv`
- figures dans `machine_learning/figures/`

### Etape 3 - Generation des visualisations metier

Notebook :

```text
visualisation/01_visualisations_churn.ipynb
```

Ce notebook :

- charge les donnees nettoyees
- genere les visualisations descriptives et analytiques
- affiche les graphiques avec `plt.show()`
- enregistre les figures dans `visualisation/figures/`

Important :

- ce notebook doit etre execute apres `01_data_cleaning_eda.ipynb`
- il est recommande d'executer aussi le notebook de modelisation avant, pour avoir un projet complet a jour

## 5. Executer seulement une partie du pipeline

### Regenerer seulement les visualisations

Si `data/cleaned_dataset.csv` existe deja :

1. ouvrir `visualisation/01_visualisations_churn.ipynb`
2. executer toutes les cellules

### Re-entrainer seulement les modeles

Si `data/cleaned_dataset.csv` existe deja :

1. ouvrir `analyse/02_modeling_churn_prediction.ipynb`
2. executer toutes les cellules

## 6. Lancer le backend FastAPI

Depuis la racine du projet :

```powershell
cd churn_analysis_python
uvicorn backend.main:app --reload
```

Le backend sera accessible ici :

- API : `http://127.0.0.1:8000`
- Documentation : `http://127.0.0.1:8000/docs`

Le backend :

- charge le modele `Random Forest`
- expose une route `/predict`
- sert aussi les figures analytiques et machine learning

## 7. Lancer le frontend React

Dans un second terminal :

```powershell
cd churn_analysis_python/frontend
npm run dev
```

Ouvrir ensuite l'URL affichee par Vite, souvent :

```text
http://localhost:5173
```

## 8. Ordre recommande pour lancer l'application complete

Si vous partez de zero :

1. installer les dependances Python
2. installer les dependances frontend
3. executer `analyse/01_data_cleaning_eda.ipynb`
4. executer `analyse/02_modeling_churn_prediction.ipynb`
5. executer `visualisation/01_visualisations_churn.ipynb`
6. lancer le backend FastAPI
7. lancer le frontend React

## 9. Resume rapide des commandes

### Installation

```powershell
cd churn_analysis_python
pip install -r requirements.txt
cd frontend
npm install
```

### Jupyter

```powershell
cd churn_analysis_python
jupyter notebook
```

### Backend

```powershell
cd churn_analysis_python
uvicorn backend.main:app --reload
```

### Frontend

```powershell
cd churn_analysis_python/frontend
npm run dev
```

## 10. Resultats attendus

Apres execution complete du projet, vous devez obtenir :

- un dataset nettoye dans `data/`
- des figures d'analyse dans `visualisation/figures/`
- des modeles et figures ML dans `machine_learning/`
- une API locale FastAPI operationnelle
- une interface React locale pour consulter les analyses et tester une prediction

## 11. Notes utiles

- Le notebook de visualisation affiche les figures et les enregistre aussi dans le dossier `visualisation/figures/`
- Le modele final utilise par l'API est le `Random Forest`
- La `Logistic Regression` est conservee pour l'interpretation des facteurs du churn
- Si le backend signale que le modele est introuvable, il faut reexecuter `analyse/02_modeling_churn_prediction.ipynb`
