<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F2027,50:203A43,100:2C5364&height=220&section=header&text=Shoppers%20Intention%20AI&fontSize=42&fontColor=00D9FF&animation=fadeIn&fontAlignY=38&desc=Predicting%20Purchase%20Intent%20Before%20It%20Happens&descAlignY=58&descSize=18&descColor=8FE3FF" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=00D9FF&center=true&vCenter=true&width=780&lines=Online+Shoppers+Purchasing+Intention+Predictor;Random+Forest+%7C+89.25%25+Accuracy;GridSearchCV-Tuned+%7C+4+Models+Benchmarked;Turning+Clickstream+Data+into+Revenue+Signals" alt="Typing SVG" />

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-0F2027?style=for-the-badge&logo=python&logoColor=00D9FF)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-203A43?style=for-the-badge&logo=scikitlearn&logoColor=00D9FF)](https://scikit-learn.org)
[![Pandas](https://img.shields.io/badge/Pandas-Data-2C5364?style=for-the-badge&logo=pandas&logoColor=00D9FF)](https://pandas.pydata.org)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-0F2027?style=for-the-badge&logo=jupyter&logoColor=00D9FF)](https://jupyter.org)
[![License](https://img.shields.io/badge/License-MIT-203A43?style=for-the-badge&logoColor=00D9FF)](#-license)

<br/>

<img src="https://img.shields.io/badge/Dataset-12%2C330%20Sessions-0A1929?style=flat-square&labelColor=0F2027&color=00D9FF"/>
<img src="https://img.shields.io/badge/Best%20Model-Random%20Forest-0A1929?style=flat-square&labelColor=0F2027&color=00D9FF"/>
<img src="https://img.shields.io/badge/Accuracy-89.25%25-0A1929?style=flat-square&labelColor=0F2027&color=00D9FF"/>
<img src="https://img.shields.io/badge/Models%20Compared-4-0A1929?style=flat-square&labelColor=0F2027&color=00D9FF"/>

</div>

<br/>

## 🧠 Overview

**Shoppers Intention AI** analyzes real e‑commerce session behavior — page views, bounce rates, exit rates, session duration, and browsing patterns — to predict whether a visitor will **complete a purchase** before they ever click "checkout."

Built on the UCI **Online Shoppers Purchasing Intention Dataset** (12,330 real sessions, 18 features), this project benchmarks four classification algorithms end‑to‑end: from raw clickstream data → EDA → feature engineering → hyperparameter tuning → model comparison, giving e‑commerce teams a data‑driven early‑warning signal for conversion.

> Think of it as a **behavioral radar** for online stores — instead of waiting for revenue at checkout, it senses buying intent from *how* a customer moves through the site.

<br/>

## 📊 Live Model Comparison

<div align="center">
<img src="https://quickchart.io/chart?width=650&height=340&backgroundColor=%230A1929&c={type:'bar',data:{labels:['Logistic Regression','KNN (Tuned)','Decision Tree (Tuned)','Random Forest'],datasets:[{label:'Test Accuracy (%)',data:[87.27,86.58,88.69,89.25],backgroundColor:['%23145374','%231A6985','%23188FA7','%2300D9FF'],borderRadius:6}]},options:{plugins:{legend:{labels:{color:'%23D6F6FF'}}},scales:{y:{min:80,max:92,ticks:{color:'%23D6F6FF'},grid:{color:'%231C3E4A'}},x:{ticks:{color:'%23D6F6FF'},grid:{display:false}}}}}" alt="Model Comparison Chart" width="650"/>
</div>

<div align="center">

| Rank | Model | Test Accuracy | Tuning Method | Verdict |
|:---:|:---|:---:|:---:|:---|
| 🥇 | **Random Forest** | **89.25%** | Baseline (GridSearchCV explored) | ✅ Best overall — robust to noise & non‑linearity |
| 🥈 | **Decision Tree** | 88.69% | GridSearchCV (`entropy`, depth=5) | Strong, highly interpretable |
| 🥉 | **Logistic Regression** | 87.27% | GridSearchCV (`C=1`, `l2`) | Solid linear baseline |
| 4️⃣ | **K‑Nearest Neighbors** | 86.58% | GridSearchCV (`k=9`, `distance`, `euclidean`) | Best CV score 87.78%, weaker on holdout |

</div>

<br/>

## 🎯 The Problem

Only **~15.5%** of shopping sessions in the raw data end in a purchase (1,908 of 12,330) — a heavily imbalanced, real‑world problem. The model has to learn subtle behavioral cues rather than relying on class frequency, which is exactly what makes this a genuinely useful benchmark rather than a toy dataset.

<div align="center">

```mermaid
%%{init: {'theme':'dark', 'themeVariables': {'primaryColor':'#00D9FF','primaryTextColor':'#D6F6FF','primaryBorderColor':'#00D9FF','lineColor':'#00D9FF','secondaryColor':'#203A43','tertiaryColor':'#0F2027','background':'#0A1929','mainBkg':'#0F2027','textColor':'#D6F6FF'}}}%%
flowchart LR
    A[🛒 Raw Session Data<br/>12,330 rows · 18 features] --> B[🧹 Cleaning &<br/>Missing Value Audit]
    B --> C[📈 EDA<br/>Bounce · Exit · PageValues]
    C --> D[🔢 Encoding<br/>One-Hot + Label Encoding]
    D --> E[⚖️ Scaling<br/>StandardScaler]
    E --> F[🧪 Train / Test Split<br/>80 / 20]
    F --> G{4 Models +<br/>GridSearchCV}
    G --> H1[Logistic Regression]
    G --> H2[KNN]
    G --> H3[Decision Tree]
    G --> H4[Random Forest]
    H1 & H2 & H3 & H4 --> I[🏆 Best Model Selected]
    I --> J[📦 Serialized .pkl]
```

</div>

<br/>

## 🧬 Feature Signals That Matter Most

<div align="center">

| Feature Group | What It Captures | Why It Predicts Intent |
|---|---|---|
| `BounceRates` / `ExitRates` | How quickly a visitor leaves | High rates → low intent to buy |
| `PageValues` | Google Analytics page value score | Strongest single purchase predictor |
| `ProductRelated` / `_Duration` | Time & depth spent on product pages | Engagement = intent signal |
| `Month`, `SpecialDay`, `Weekend` | Seasonality & proximity to holidays | Captures campaign‑driven spikes |
| `VisitorType` | New vs. Returning visitor | Returning visitors convert differently |
| `OperatingSystems`, `Browser`, `Region`, `TrafficType` | Technical & acquisition context | Channel‑level conversion differences |

</div>

<br/>

## 🛠️ Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=python,sklearn,pandas,jupyter,vscode,git,github" />

<br/><br/>

`pandas` · `numpy` · `seaborn` · `matplotlib` · `plotly` · `scikit-learn` · `joblib`

</div>

<br/>

## ⚙️ Pipeline Breakdown

<details>
<summary><b>1️⃣ Exploratory Data Analysis</b> — click to expand</summary>
<br/>

- Full shape, dtype, null and duplicate audit (`12,330 × 18`, zero missing values)
- Distribution plots for `Revenue`, `VisitorType`, `Month`
- Bounce/Exit/PageValues boxplots split by purchase outcome
- Full correlation heatmap across numeric features

</details>

<details>
<summary><b>2️⃣ Feature Engineering</b> — click to expand</summary>
<br/>

- One‑hot encoding for categorical columns (`Month`, `VisitorType`, etc.)
- Label encoding pass for remaining categorical fields
- Boolean → integer conversion for `Weekend` and `Revenue`
- `StandardScaler` applied for distance‑based models (KNN, Logistic Regression)

</details>

<details>
<summary><b>3️⃣ Model Training & Tuning</b> — click to expand</summary>
<br/>

- **Logistic Regression** — `GridSearchCV` over `C` and `penalty`
- **K‑Nearest Neighbors** — tuned `n_neighbors`, `weights`, `distance metric`
- **Decision Tree** — tuned `criterion`, `max_depth`, `min_samples_split/leaf`
- **Random Forest** — ensemble baseline, explored via `GridSearchCV`
- 5‑fold cross‑validation (`cv=5`, `scoring='accuracy'`) throughout

</details>

<details>
<summary><b>4️⃣ Evaluation & Comparison</b> — click to expand</summary>
<br/>

- Accuracy scored on a held‑out 20% test split for every model
- Results consolidated into a single ranked comparison table
- Random Forest selected as the top performer

</details>

<br/>

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Omrawat11/shoppers-intention-model.git
cd shoppers-intention-model

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install pandas numpy scikit-learn seaborn matplotlib plotly joblib jupyter

# Launch the notebook
jupyter notebook Shoppers_intention_model.ipynb
```

### Loading the trained model

```python
import joblib

model = joblib.load("Shoppers_intention_model.pkl")
prediction = model.predict(X_new)
```

> ⚠️ **Heads‑up:** the notebook's final export cell currently saves the **model class reference** rather than the **fitted `best_rf` estimator**, so the shipped `.pkl` isn't loadable as-is. Swap the last line to `joblib.dump(best_rf, "Shoppers_intention_model.pkl")` and re-run to ship a working, trained model file.

<br/>

## 📁 Project Structure

```
shoppers-intention-model/
├── 📓 Shoppers_intention_model.ipynb   # Full EDA → training → evaluation pipeline
├── 📦 Shoppers_intention_model.pkl     # Serialized model
├── 📄 online_shoppers_intention.csv    # UCI dataset (12,330 sessions)
└── 📝 README.md
```

<br/>

## 🗺️ Roadmap

- [ ] Fix serialization to export the fitted `best_rf` estimator
- [ ] Add SHAP-based explainability for feature‑level predictions
- [ ] Wrap the model in a Streamlit / FastAPI inference app
- [ ] Address class imbalance with SMOTE and compare F1/AUC
- [ ] Deploy as a real‑time API for live session scoring

<br/>

## 🙌 Acknowledgements

Built on the **Online Shoppers Purchasing Intention Dataset** (UCI Machine Learning Repository), a widely used benchmark for e‑commerce behavioral analytics.

<br/>

## 📜 License

Released under the **MIT License** — free to use, modify, and build on.

<br/>

<div align="center">

### 💬 Let's Connect

[![GitHub](https://img.shields.io/badge/GitHub-Omrawat11-0F2027?style=for-the-badge&logo=github&logoColor=00D9FF)](https://github.com/Omrawat11)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-203A43?style=for-the-badge&logo=linkedin&logoColor=00D9FF)](https://linkedin.com)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2C5364,50:203A43,100:0F2027&height=120&section=footer" width="100%"/>

</div>
