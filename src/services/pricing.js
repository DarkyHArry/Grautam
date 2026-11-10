// Motor de Precificação Dinâmica e Tarifas Regulatórias - Grautam Viagens

const AIRPORT_TAXES = {
  DOMESTIC: {
    baseTaxBrl: 42.50,
    securityFeeBrl: 8.90
  },
  INTERNATIONAL: {
    baseTaxBrl: 148.90,
    securityFeeBrl: 24.50
  }
};

function calculateBoardingTax(isInternational = false) {
  const tax = isInternational ? AIRPORT_TAXES.INTERNATIONAL : AIRPORT_TAXES.DOMESTIC;
  return Math.round((tax.baseTaxBrl + tax.securityFeeBrl) * 100) / 100;
}

function calculateDynamicMultiplier(departureDateStr, seatsAvailable = 5) {
  const now = new Date();
  const dep = new Date(`${departureDateStr}T12:00:00`);
  const diffDays = Math.max(0, Math.ceil((dep - now) / (1000 * 60 * 60 * 24)));

  // Curva de compra antecipada (Yield Management)
  let advanceCurve = 1.0;
  if (diffDays > 60) advanceCurve = 0.82; // Desconto compra antecipada
  else if (diffDays > 30) advanceCurve = 0.90;
  else if (diffDays > 14) advanceCurve = 1.00;
  else if (diffDays > 7) advanceCurve = 1.18;
  else advanceCurve = 1.45; // Última hora (alta demanda)

  // Fator dia da semana (sexta e domingo são mais caros)
  const dayOfWeek = dep.getDay(); // 0 = Domingo, 5 = Sexta
  const weekendSurge = (dayOfWeek === 0 || dayOfWeek === 5) ? 1.15 : 1.0;

  // Fator escassez de assentos
  const scarcityFactor = seatsAvailable <= 3 ? 1.20 : 1.0;

  return Math.round(advanceCurve * weekendSurge * scarcityFactor * 100) / 100;
}

module.exports = {
  AIRPORT_TAXES,
  calculateBoardingTax,
  calculateDynamicMultiplier
};
