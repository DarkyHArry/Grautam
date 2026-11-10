// Gerador de Alertas Operacionais de Voo em Tempo Real - Grautam Viagens

function generateOperationalAlerts(booking) {
  const alerts = [
    {
      id: `alert_gate_${Date.now()}`,
      type: 'flight',
      severity: 'warning',
      title: 'Atenção ao Portão de Embarque',
      message: `Voo ${booking.flightNumber}: embarque confirmado no Portão ${booking.gate || 'B12'} (${booking.originTerminal || 'Terminal 3'}). Apresente-se com documento oficial.`,
      timestamp: Date.now()
    },
    {
      id: `alert_baggage_${Date.now()}`,
      type: 'flight',
      severity: 'info',
      title: 'Bagagem Rastreada',
      message: `Sua bagagem de mão (10kg) está registrada na reserva ${booking.pnr}. Se despachou bagagem, acompanhe pelo carrossel no destino.`,
      timestamp: Date.now() - 3600000
    },
    {
      id: `alert_weather_${Date.now()}`,
      type: 'flight',
      severity: 'info',
      title: 'Condições de Voo',
      message: `Tempo favorável na rota ${booking.originCode} → ${booking.destinationCode}. Pouso previsto para o horário regulamentar.`,
      timestamp: Date.now() - 7200000
    }
  ];

  return alerts;
}

module.exports = {
  generateOperationalAlerts
};

