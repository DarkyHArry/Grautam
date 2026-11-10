// Gerador de Padrão IATA BCBP (Bar Coded Boarding Pass) e SVG Barcode

function generateIataBcbpString(booking) {
  // Padrão IATA Resolução 792 (Formato M1)
  const pax = (booking.passengers?.[0]?.name || 'PASSAGEIRO/CARLOS').toUpperCase().slice(0, 20).padEnd(20, ' ');
  const pnr = (booking.pnr || 'GTM9999').toUpperCase().slice(0, 7).padEnd(7, ' ');
  const orig = (booking.originCode || 'GRU').toUpperCase().slice(0, 3);
  const dest = (booking.destinationCode || 'GIG').toUpperCase().slice(0, 3);
  const airline = (booking.airline?.slice(0, 2) || 'GT').toUpperCase();
  const flight = (booking.flightNumber?.replace(/\D/g, '') || '3012').padStart(5, '0');
  const seat = (booking.seat || '12A').padStart(4, '0');

  return `M1${pax}E${pnr}${orig}${dest}${airline}${flight}001Y${seat}0001 100`;
}

function generateSvgBarcode(codeString = 'GRAUTAM-BOARDING-PASS') {
  const bars = [];
  let x = 10;
  for (let i = 0; i < codeString.length; i++) {
    const charCode = codeString.charCodeAt(i);
    const width = (charCode % 4) + 1;
    bars.push(`<rect x="${x}" y="0" width="${width}" height="50" fill="#181816"/>`);
    x += width + 2;
  }

  return `
    <svg viewBox="0 0 ${x + 10} 50" width="100%" height="44" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      ${bars.join('\n')}
    </svg>
  `;
}

module.exports = {
  generateIataBcbpString,
  generateSvgBarcode
};
