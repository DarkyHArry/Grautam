// Gerador de Recibo Fiscal e Comprovante de Pagamento - Grautam Viagens

function generateReceiptHtml(booking) {
  const fare = Math.round((booking.total * 0.82) * 100) / 100;
  const taxes = Math.round((booking.total * 0.12) * 100) / 100;
  const extras = Math.round((booking.total - fare - taxes) * 100) / 100;

  return `
    <div class="receipt-document" style="font-family: monospace; padding: 24px; color: #181816; background: #ffffff; border-radius: 8px;">
      <div style="border-bottom: 2px solid #181816; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 18px;">GRAUTAM VIAGENS &amp; TURISMO S.A.</h2>
        <small>CNPJ: 04.912.840/0001-92 · SAC: 0800 782 4100</small><br>
        <b style="font-size: 14px;">COMPROVANTE DE VENDA DE PASSAGEM AÉREA</b>
      </div>

      <div style="margin-bottom: 14px;">
        <div><b>LOCALIZADOR (PNR):</b> ${booking.pnr}</div>
        <div><b>E-TICKET:</b> ${booking.eticket}</div>
        <div><b>DATA DE EMISSÃO:</b> ${new Date(booking.createdAt).toLocaleString('pt-BR')}</div>
        <div><b>STATUS:</b> ${booking.status}</div>
      </div>

      <div style="margin-bottom: 14px; border-top: 1px dashed #666; padding-top: 8px;">
        <div><b>PASSAGEIRO:</b> ${booking.passengers?.[0]?.name || 'Carlos Silveira'}</div>
        <div><b>DOCUMENTO:</b> ${booking.passengers?.[0]?.document || '284.912.840-12'}</div>
        <div><b>VOO:</b> ${booking.flightNumber} (${booking.airline})</div>
        <div><b>ROTA:</b> ${booking.origin} → ${booking.destination}</div>
        <div><b>DATA DO VOO:</b> ${booking.date} às ${booking.departureTime}</div>
        <div><b>ASSENTO:</b> ${booking.seat} (${booking.cabinClass})</div>
      </div>

      <div style="border-top: 1px solid #181816; border-bottom: 1px solid #181816; padding: 8px 0; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Tarifa Base Aérea:</span>
          <span>R$ ${fare.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tarifa de Embarque (ANAC):</span>
          <span>R$ ${taxes.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Serviços Adicionais:</span>
          <span>R$ ${extras.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px; font-size: 14px;">
          <span>VALOR TOTAL PAGO:</span>
          <span>R$ ${booking.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="font-size: 11px;">
        <div><b>FORMA DE PAGAMENTO:</b> ${booking.paymentMethod} (${booking.installments || '1x'})</div>
        <small style="display: block; margin-top: 8px; color: #555;">Este comprovante serve como confirmação de emissão de bilhete aéreo eletrônico em conformidade com as normas ANAC.</small>
      </div>
    </div>
  `;
}

module.exports = {
  generateReceiptHtml
};

