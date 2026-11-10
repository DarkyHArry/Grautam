// Métricas, Gastos e Estatísticas de Viagem do Passageiro - Grautam Viagens

function calculateTravelAnalytics(bookings = []) {
  const confirmed = bookings.filter(b => b.status === 'CONFIRMADO');

  const totalSpentBrl = confirmed.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const totalFlights = confirmed.length;

  const airlinesCount = {};
  const destinationsCount = {};
  let totalDistanceEstimatedKm = 0;

  confirmed.forEach(b => {
    airlinesCount[b.airline] = (airlinesCount[b.airline] || 0) + 1;
    destinationsCount[b.destination] = (destinationsCount[b.destination] || 0) + 1;
    totalDistanceEstimatedKm += 650; // Média estimada de voos
  });

  // Cálculo de Pegada de Carbono (estimativa média de 90g de CO2 por km de passageiro)
  const estimatedCo2Kg = Math.round((totalDistanceEstimatedKm * 0.09) * 10) / 10;
  const treesToOffset = Math.ceil(estimatedCo2Kg / 22); // 1 árvore compensa ~22kg de CO2/ano

  return {
    totalSpentBrl: Math.round(totalSpentBrl * 100) / 100,
    totalFlights,
    totalDistanceEstimatedKm,
    estimatedCo2Kg,
    treesToOffset,
    airlinesCount,
    destinationsCount
  };
}

module.exports = {
  calculateTravelAnalytics
};

