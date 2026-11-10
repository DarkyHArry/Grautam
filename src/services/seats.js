// Gerenciador e Classificador de Assentos da Aeronave - Grautam Viagens

const SEAT_CATEGORIES = {
  BUSINESS: { name: 'Classe Executiva', surchargeBrl: 420.0, legroomCm: 96, recline: '180° Flat-bed', rows: [1, 2, 3] },
  EXTRA_LEGROOM: { name: 'Espaço Grautam +', surchargeBrl: 45.0, legroomCm: 86, recline: 'Padrão', rows: [4, 5, 12] }, // Fileira 12 = Saída de emergência
  STANDARD: { name: 'Econômica Padrão', surchargeBrl: 0.0, legroomCm: 79, recline: 'Padrão', rows: [6, 7, 8, 9, 10, 11, 14, 15] }
};

function getSeatDetails(seatCode) {
  if (!seatCode) return null;
  const match = seatCode.match(/^(\d+)([A-F])$/);
  if (!match) return null;
  const row = Number(match[1]);
  const letter = match[2];

  let category = SEAT_CATEGORIES.STANDARD;
  if (SEAT_CATEGORIES.BUSINESS.rows.includes(row)) {
    category = SEAT_CATEGORIES.BUSINESS;
  } else if (SEAT_CATEGORIES.EXTRA_LEGROOM.rows.includes(row)) {
    category = SEAT_CATEGORIES.EXTRA_LEGROOM;
  }

  const isWindow = ['A', 'F'].includes(letter);
  const isAisle = ['C', 'D'].includes(letter);
  const position = isWindow ? 'Janela' : isAisle ? 'Corredor' : 'Meio';
  const isEmergencyExit = row === 12;

  return {
    code: seatCode,
    row,
    letter,
    position,
    categoryName: category.name,
    surcharge: category.surchargeBrl,
    legroom: `${category.legroomCm} cm`,
    isEmergencyExit,
    requirements: isEmergencyExit ? 'Maior de 18 anos, sem restrições de mobilidade para auxiliar tripulação.' : null
  };
}

module.exports = {
  SEAT_CATEGORIES,
  getSeatDetails
};

