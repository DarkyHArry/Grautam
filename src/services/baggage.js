// Calculadora de Franquia de Bagagem e Excesso de Peso - Grautam Viagens

const BAGGAGE_RULES = {
  carryOn: {
    maxWeightKg: 10,
    maxDimensionsCm: '55 x 35 x 25 cm',
    personalItem: '1 mochila ou bolsa pequena (sob o assento à frente)',
    free: true
  },
  checked: {
    standardWeightKg: 23,
    maxLinearDimensionsCm: 158,
    firstBagPriceBrl: 110.0,
    secondBagPriceBrl: 160.0,
    additionalBagPriceBrl: 220.0
  },
  excess: {
    pricePerKgBrl: 35.0,
    maxWeightPerPieceKg: 32 // Limite absoluto de segurança ocupacional
  },
  special: [
    { type: 'Prancha de Surf', feeBrl: 150.0, req: 'Capa acolchoada' },
    { type: 'Instrumento Musical', feeBrl: 120.0, req: 'Hardcase rígido' },
    { type: 'Bicicleta', feeBrl: 180.0, req: 'Desmontada em mala bike' }
  ]
};

function calculateBaggageFee(numCheckedBags = 0, excessKg = 0, specialItems = []) {
  let total = 0;
  if (numCheckedBags >= 1) total += BAGGAGE_RULES.checked.firstBagPriceBrl;
  if (numCheckedBags >= 2) total += BAGGAGE_RULES.checked.secondBagPriceBrl;
  if (numCheckedBags > 2) total += (numCheckedBags - 2) * BAGGAGE_RULES.checked.additionalBagPriceBrl;

  if (excessKg > 0) {
    total += excessKg * BAGGAGE_RULES.excess.pricePerKgBrl;
  }

  specialItems.forEach(item => {
    const spec = BAGGAGE_RULES.special.find(s => s.type === item);
    if (spec) total += spec.feeBrl;
  });

  return Math.round(total * 100) / 100;
}

module.exports = {
  BAGGAGE_RULES,
  calculateBaggageFee
};
