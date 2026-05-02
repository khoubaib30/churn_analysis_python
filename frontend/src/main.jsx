import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = 'http://127.0.0.1:8000';

const initialCustomer = {
  gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 2,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 75,
  TotalCharges: 150,
};

const fieldMeta = {
  gender: {
    label: 'Genre',
    type: 'select',
    options: [
      { value: 'Female', label: 'Femme' },
      { value: 'Male', label: 'Homme' },
    ],
  },
  SeniorCitizen: {
    label: 'Client senior',
    type: 'select',
    help: "Le modele attend 0 ou 1, mais ici le champ est traduit en Oui / Non.",
    options: [
      { value: 0, label: 'Non' },
      { value: 1, label: 'Oui' },
    ],
  },
  Partner: {
    label: 'A un partenaire',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Oui' },
      { value: 'No', label: 'Non' },
    ],
  },
  Dependents: {
    label: 'A des personnes a charge',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Oui' },
      { value: 'No', label: 'Non' },
    ],
  },
  tenure: {
    label: 'Anciennete (mois)',
    type: 'number',
    min: 0,
    max: 72,
    step: 1,
    help: "Le risque de churn est souvent plus eleve au debut de la relation client.",
  },
  PhoneService: {
    label: 'Service telephonique',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Oui' },
      { value: 'No', label: 'Non' },
    ],
  },
  MultipleLines: {
    label: 'Plusieurs lignes',
    type: 'select',
    help: "Si le client n'a pas de telephone, choisis 'Pas de service telephonique'.",
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No phone service', label: 'Pas de service telephonique' },
    ],
  },
  InternetService: {
    label: 'Service internet',
    type: 'select',
    options: [
      { value: 'DSL', label: 'DSL' },
      { value: 'Fiber optic', label: 'Fibre optique' },
      { value: 'No', label: "Pas d'internet" },
    ],
  },
  OnlineSecurity: {
    label: 'Securite en ligne',
    type: 'select',
    help: "Choisis 'Pas de service internet' si le client n'a pas d'abonnement internet.",
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  OnlineBackup: {
    label: 'Sauvegarde en ligne',
    type: 'select',
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  DeviceProtection: {
    label: 'Protection des appareils',
    type: 'select',
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  TechSupport: {
    label: 'Support technique',
    type: 'select',
    help: "Cette variable ressort fortement dans l'analyse du churn.",
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  StreamingTV: {
    label: 'Streaming TV',
    type: 'select',
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  StreamingMovies: {
    label: 'Streaming films',
    type: 'select',
    options: [
      { value: 'No', label: 'Non' },
      { value: 'Yes', label: 'Oui' },
      { value: 'No internet service', label: "Pas de service internet" },
    ],
  },
  Contract: {
    label: 'Type de contrat',
    type: 'select',
    options: [
      { value: 'Month-to-month', label: 'Mensuel' },
      { value: 'One year', label: 'Un an' },
      { value: 'Two year', label: 'Deux ans' },
    ],
  },
  PaperlessBilling: {
    label: 'Facturation sans papier',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Oui' },
      { value: 'No', label: 'Non' },
    ],
  },
  PaymentMethod: {
    label: 'Mode de paiement',
    type: 'select',
    help: "Le paiement par electronic check est l'un des signaux les plus fragiles dans les analyses.",
    options: [
      { value: 'Electronic check', label: 'Electronic check' },
      { value: 'Mailed check', label: 'Cheque postal' },
      { value: 'Bank transfer (automatic)', label: 'Virement automatique' },
      { value: 'Credit card (automatic)', label: 'Carte bancaire automatique' },
    ],
  },
  MonthlyCharges: {
    label: 'Charges mensuelles',
    type: 'number',
    min: 0,
    step: 0.01,
  },
  TotalCharges: {
    label: 'Charges totales',
    type: 'number',
    min: 0,
    step: 0.01,
    help: "Montant total facture depuis le debut. Il peut rester faible pour un client tres recent.",
  },
};

const fieldGroups = [
  {
    title: 'Profil client',
    fields: ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure'],
  },
  {
    title: 'Services',
    fields: ['PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies'],
  },
  {
    title: 'Contrat et facturation',
    fields: ['Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges'],
  },
];

const analysisStats = [
  { label: 'Clients analyses', value: '7 043' },
  { label: 'Taux de churn global', value: '26.5%' },
  { label: 'Contrats mensuels', value: '55.0%' },
  { label: 'Segment le plus fragile', value: 'Clients 0-1 mois' },
];

const churnReasons = [
  {
    title: 'Contrat mensuel',
    stat: '42.7%',
    text: "Les clients engages au mois presentent le taux de churn le plus eleve.",
  },
  {
    title: 'Electronic check',
    stat: '45.3%',
    text: "Ce mode de paiement est nettement plus expose que les options automatiques.",
  },
  {
    title: 'Tres faible anciennete',
    stat: '60.9%',
    text: "Le risque culmine chez les clients entre 0 et 1 mois d'anciennete.",
  },
  {
    title: 'Pas de support technique',
    stat: '41.6%',
    text: "L'absence de support technique ressort comme un marqueur fort du churn.",
  },
];

const analysisFigures = [
  {
    title: 'Repartition churn / non churn',
    description: 'Vue globale de la cible pour comprendre l equilibre de la base.',
    src: `${API_BASE}/analysis-figures/base_churn_distribution.png`,
  },
  {
    title: 'Churn selon le contrat',
    description: 'Le contrat mensuel concentre la plus forte fragilite client.',
    src: `${API_BASE}/analysis-figures/churn_by_contract.png`,
  },
  {
    title: 'Churn selon le paiement',
    description: "Le mode de paiement raconte une partie importante de l'attrition.",
    src: `${API_BASE}/analysis-figures/churn_by_payment_method.png`,
  },
  {
    title: 'Churn selon l anciennete',
    description: 'La courbe montre la chute du risque quand la relation dure.',
    src: `${API_BASE}/analysis-figures/churn_by_tenure.png`,
  },
];

function Field({ name, value, onChange }) {
  const meta = fieldMeta[name];

  if (!meta) return null;

  return (
    <label className="field-card">
      <div className="field-header">
        <span>{meta.label}</span>
        {meta.help ? <small>{meta.help}</small> : null}
      </div>
      {meta.type === 'select' ? (
        <select value={value} onChange={(e) => onChange(name, e.target.value)}>
          {meta.options.map((option) => (
            <option key={`${name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          value={value}
          min={meta.min}
          max={meta.max}
          step={meta.step ?? 1}
          onChange={(e) => onChange(name, Number(e.target.value))}
        />
      )}
    </label>
  );
}

function App() {
  const [customer, setCustomer] = useState(initialCustomer);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('analysis');

  const update = (name, value) => {
    const numeric = ['SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges'];
    setCustomer({ ...customer, [name]: numeric.includes(name) ? Number(value) : value });
  };

  const predict = async () => {
    setError('');
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!response.ok) throw new Error('API indisponible');
      setResult(await response.json());
    } catch (err) {
      setError("Impossible de joindre FastAPI. Lance d'abord le backend avec uvicorn.");
    }
  };

  const resultLabel = useMemo(() => {
    if (!result) return '';
    return result.prediction === 'Yes' ? 'Client a risque de churn' : 'Client plutot stable';
  }, [result]);

  return (
    <main className="page-shell">
      <section className="hero hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">Observatoire Du Churn Client</p>
          <h1>Voir les signaux du churn avant qu ils ne coutent des clients.</h1>
          <p>
            Une interface locale qui separe clairement l analyse de la base et la prediction. On lit d abord les
            tendances, puis on teste un profil client avec le modele.
          </p>
        </div>
        <div className="hero-aside">
          <div className="hero-orbit">
            <div className="hero-core">
              <small>Focus churn</small>
              <strong>7 043</strong>
              <span>clients explores</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-switcher">
        <button
          className={activeSection === 'analysis' ? 'switch-button active' : 'switch-button'}
          onClick={() => setActiveSection('analysis')}
        >
          Analyse
        </button>
        <button
          className={activeSection === 'prediction' ? 'switch-button active' : 'switch-button'}
          onClick={() => setActiveSection('prediction')}
        >
          Prediction
        </button>
      </section>

      {activeSection === 'analysis' ? (
        <section className="panel insight-panel">
          <div className="section-heading">
            <h2>Section analyse</h2>
            <p>
              Cette partie raconte la base et les segments a risque a partir des chiffres globaux et des courbes
              analytiques deja produites dans le projet.
            </p>
          </div>

          <div className="kpi-grid">
            {analysisStats.map((item) => (
              <article key={item.label} className="kpi-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

        <div className="analytics-grid">
          {churnReasons.map((item) => (
            <article key={item.title} className="analytics-card">
              <span className="analytics-stat">{item.stat}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <p className="analysis-note">
          Lecture importante : les pourcentages affiches ici sont des taux de churn a l'interieur de chaque groupe.
          Par exemple, 42.7% pour le contrat mensuel signifie que 42.7% des clients ayant un contrat mensuel quittent
          l'entreprise. Ces valeurs ne representent donc pas des parts d'un meme total.
        </p>

        <div className="figure-grid">
          {analysisFigures.map((figure) => (
            <article key={figure.title} className="figure-card">
                <div className="figure-copy">
                  <h3>{figure.title}</h3>
                  <p>{figure.description}</p>
                </div>
                <img src={figure.src} alt={figure.title} />
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="grid prediction-grid">
          <div className="panel form-panel">
            <div className="panel-intro">
              <h2>Section prediction</h2>
              <p>
                Les champs sont traduits en langage metier. Quand une variable peut preter a confusion, une aide apparait
                directement sous le label.
              </p>
            </div>

            {fieldGroups.map((group) => (
              <section key={group.title} className="form-section">
                <div className="section-heading">
                  <h3>{group.title}</h3>
                </div>
                <div className="form-grid">
                  {group.fields.map((field) => (
                    <Field key={field} name={field} value={customer[field]} onChange={update} />
                  ))}
                </div>
              </section>
            ))}

            <button onClick={predict}>Predire le churn</button>
          </div>

          <aside className="panel result-panel">
            <h2>Lecture du resultat</h2>
            {!result && !error && <p className="muted">Remplis le profil client puis lance une prediction.</p>}
            {error && <p className="error">{error}</p>}
          {result && (
            <div className="score-card">
              <span className="risk">{result.risk_level}</span>
              <strong>{Math.round(result.churn_probability * 100)}%</strong>
              <p>{resultLabel}</p>
              <p className="result-subline">Prediction brute : {result.prediction}</p>
            </div>
          )}
        </aside>
      </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
