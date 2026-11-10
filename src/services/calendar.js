// Exportador de Voo para Formato iCalendar (.ics) RFC 5545 - Grautam Viagens

function generateIcsCalendar(booking) {
  const dateStr = booking.date ? booking.date.replace(/-/g, '') : '20261125';
  const depTimeClean = (booking.departureTime || '08:00').replace(':', '') + '00';
  const arrTimeClean = (booking.arrivalTime || '09:15').replace(':', '') + '00';

  const startUtc = `${dateStr}T${depTimeClean}`;
  const endUtc = `${dateStr}T${arrTimeClean}`;
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grautam Linhas Aereas//Booking System//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:grautam-flight-${booking.pnr || 'booking'}@grautam.com.br`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:Voo ${booking.flightNumber}: ${booking.originCode} para ${booking.destinationCode}`,
    `DESCRIPTION:Passagem Grautam emitida.\\nLocalizador PNR: ${booking.pnr}\\nAssento: ${booking.seat}\\nTerminal: ${booking.originTerminal || 'T3'}\\nPortao: ${booking.gate || 'B12'}\\nPassageiro: ${booking.passengers?.[0]?.name || 'Carlos Silveira'}`,
    `LOCATION:${booking.origin}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete de voo: Dirija-se ao aeroporto com documento oficial.',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

module.exports = {
  generateIcsCalendar
};

