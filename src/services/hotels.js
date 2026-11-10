// Recomendações de Hospedagem Parceira nos Destinos - Grautam Viagens

const HOTELS_BY_DESTINATION = {
  GIG: [
    { name: 'Hotel Copacabana Palace Grautam Partner', rating: 4.9, priceNightBrl: 1120, location: 'Copacabana, Rio de Janeiro', perks: ['Vista Mar', 'Café da Manhã', 'Cancelamento Grátis'] },
    { name: 'Ipanema Ocean View Design Hotel', rating: 4.7, priceNightBrl: 580, location: 'Ipanema, Rio de Janeiro', perks: ['Piscina Rooftop', 'Wi-Fi 500Mbps'] }
  ],
  SSA: [
    { name: 'Fasano Salvador Histórico', rating: 4.8, priceNightBrl: 940, location: 'Centro Histórico, Salvador', perks: ['Spa & Bem-estar', 'Piscina Panorâmica'] },
    { name: 'Resort Stella Maris All Inclusive', rating: 4.6, priceNightBrl: 490, location: 'Praia de Stella Maris, Salvador', perks: ['Pé na Areia', 'All Inclusive'] }
  ],
  FEN: [
    { name: 'Pousada Maravilha Noronha', rating: 5.0, priceNightBrl: 2400, location: 'Baía do Sueste, Fernando de Noronha', perks: ['Piscina Borda Infinita', 'Passeios Inclusos'] },
    { name: 'Pousada Triboju Eco Resort', rating: 4.9, priceNightBrl: 1650, location: 'Floresta Nova, Fernando de Noronha', perks: ['Gastronomia Autoral', 'Jacuzzi Privativa'] }
  ],
  LIS: [
    { name: 'Altis Avenida Hotel Lisboa', rating: 4.8, priceNightBrl: 890, location: 'Baixa Pombalina, Lisboa', perks: ['Próximo ao Metrô', 'Rooftop Bar'] }
  ],
  MIA: [
    { name: 'Fontainebleau Miami Beach Resort', rating: 4.7, priceNightBrl: 1450, location: 'South Beach, Miami', perks: ['Acesso Privativo à Praia', 'Boate LIV'] }
  ]
};

function getHotelsForDestination(destCode) {
  const code = String(destCode || '').toUpperCase().trim();
  return HOTELS_BY_DESTINATION[code] || [
    { name: 'Hotel Gran Metropolitan Partner', rating: 4.6, priceNightBrl: 380, location: 'Região Central', perks: ['Café da Manhã', 'Transfer Aeroporto'] }
  ];
}

module.exports = {
  getHotelsForDestination
};
