// Serviço de Check-in Online Antecipado - Grautam Viagens

function checkInEligibility(flightDateStr, departureTimeStr) {
  const flightDateTime = new Date(`${flightDateStr}T${departureTimeStr || '12:00'}:00`);
  const now = new Date();
  const diffHours = (flightDateTime - now) / (1000 * 60 * 60);

  // Check-in abre 48h antes e fecha 1h antes
  if (diffHours > 48) {
    const hoursLeft = Math.ceil(diffHours - 48);
    return {
      eligible: false,
      reason: `Check-in abrirá em ${hoursLeft} horas (48h antes da partida).`,
      opensAt: new Date(flightDateTime.getTime() - 48 * 3600000).toLocaleString('pt-BR')
    };
  }

  if (diffHours < 1) {
    return {
      eligible: false,
      reason: 'Check-in online encerrado para este voo. Dirija-se ao balcão no aeroporto.'
    };
  }

  return {
    eligible: true,
    reason: 'Check-in disponível! Confirme seus assentos e emita seu cartão de embarque.'
  };
}

function processOnlineCheckIn(booking, seatSelected) {
  const finalSeat = seatSelected || booking.seat || '12A';
  return {
    success: true,
    pnr: booking.pnr,
    checkInNumber: `CHK-${Math.floor(10000 + Math.random() * 90000)}`,
    sequenceNo: Math.floor(1 + Math.random() * 180),
    seatConfirmed: finalSeat,
    boardingTime: calculateBoardingTime(booking.departureTime),
    checkedInAt: Date.now()
  };
}

function calculateBoardingTime(departureTime) {
  if (!departureTime) return '07:30';
  const [h, m] = departureTime.split(':').map(Number);
  const totalMin = h * 60 + m - 40; // Embarque começa 40 min antes
  const bh = Math.floor(totalMin / 60);
  const bm = totalMin % 60;
  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
}

module.exports = {
  checkInEligibility,
  processOnlineCheckIn,
  calculateBoardingTime
};
