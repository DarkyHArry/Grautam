// Opções de Aluguel de Veículos no Aeroporto de Chegada - Grautam Rent a Car

const CAR_CATEGORIES = [
  {
    category: 'Econômico com Ar',
    modelExample: 'Volkswagen Polo ou Hyundai HB20',
    dailyRateBrl: 119.0,
    features: ['5 Passageiros', '2 Malas', 'Câmbio Manual', 'Ar-Condicionado'],
    freeCancellation: true
  },
  {
    category: 'Sedan Conforto',
    modelExample: 'Toyota Yaris Sedan ou Chevrolet Onix Plus',
    dailyRateBrl: 159.0,
    features: ['5 Passageiros', '3 Malas', 'Câmbio Automático', 'Central Multimídia'],
    freeCancellation: true
  },
  {
    category: 'SUV Compacto',
    modelExample: 'Jeep Renegade ou Hyundai Creta',
    dailyRateBrl: 199.0,
    features: ['5 Passageiros', '4 Malas', 'Câmbio Automático', 'Espaço Família'],
    freeCancellation: true
  },
  {
    category: 'Executivo Premium',
    modelExample: 'BMW Série 3 ou Mercedes-Benz C200',
    dailyRateBrl: 480.0,
    features: ['5 Passageiros', '3 Malas', 'Câmbio Automático', 'Bancos em Couro'],
    freeCancellation: true
  }
];

function getCarRentals(airportCode) {
  return CAR_CATEGORIES.map(c => ({
    ...c,
    pickupLocation: `Balcão de Locadoras - ${airportCode || 'Aeroporto'}`
  }));
}

module.exports = {
  CAR_CATEGORIES,
  getCarRentals
};

