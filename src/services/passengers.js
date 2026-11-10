// Gerenciador de Passageiros Frequentes e Validação Documental - Grautam Viagens

function validateCpf(cpf) {
  const clean = String(cpf || '').replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(clean.charAt(10));
}

function formatCpf(cpf) {
  const clean = String(cpf || '').replace(/\D/g, '').slice(0, 11);
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function validatePassport(passport) {
  const clean = String(passport || '').trim().toUpperCase();
  // Padrão brasileiro: 2 letras + 6 números (ex: CS849201)
  return /^[A-Z]{2}\d{6}$/.test(clean) || clean.length >= 6;
}

module.exports = {
  validateCpf,
  formatCpf,
  validatePassport
};

