// Gestor de Coberturas de Seguro Viagem - Grautam Proteção Total

const INSURANCE_PLANS = {
  BASIC: {
    id: 'plan_basic',
    name: 'Proteção Essencial',
    priceBrl: 29.90,
    medicalCoverageBrl: 30000,
    baggageCoverageBrl: 1500,
    flightCancellationBrl: 1000,
    dentalCoverageBrl: 1000,
    emergencyRepatriationBrl: 20000
  },
  FULL: {
    id: 'plan_full',
    name: 'Proteção Total Plus (Recomendado)',
    priceBrl: 49.90,
    medicalCoverageBrl: 100000,
    baggageCoverageBrl: 4000,
    flightCancellationBrl: 3500,
    dentalCoverageBrl: 2500,
    emergencyRepatriationBrl: 60000
  },
  INTERNATIONAL: {
    id: 'plan_inter',
    name: 'Proteção Internacional Platinum (Tratado de Schengen)',
    priceBrl: 89.90,
    medicalCoverageBrl: 250000, // Cobre os 30.000 EUR do Tratado de Schengen
    baggageCoverageBrl: 8000,
    flightCancellationBrl: 6000,
    dentalCoverageBrl: 5000,
    emergencyRepatriationBrl: 150000
  }
};

function issueInsuranceCertificate(planKey, passengerName, pnr) {
  const plan = INSURANCE_PLANS[planKey] || INSURANCE_PLANS.FULL;
  const policyNumber = `POL-${Math.floor(1000000 + Math.random() * 9000000)}`;

  return {
    policyNumber,
    pnr,
    passengerName,
    planName: plan.name,
    coverage: plan,
    issuedAt: Date.now(),
    emergencyPhone: '+55 (11) 3003-4400 (Atendimento Global 24h)'
  };
}

module.exports = {
  INSURANCE_PLANS,
  issueInsuranceCertificate
};

