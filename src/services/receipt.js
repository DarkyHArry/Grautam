// Gerador de Recibo e Comprovante de Pagamento - Grautam Viagens

function generateReceiptHtml(booking) {
  const fare = Math.round((booking.total * 0.82) * 100) / 100;
  const taxes = Math.round((booking.total * 0.12) * 100) / 100;
  const extras = Math.round((booking.total - fare - taxes) * 100) / 100;

  return `
    <div class="receipt-document" style="font-family: var(--font-mono, monospace); padding: 24px; color: #f5f2eb; background: #1e1e1b; border: 1px solid #383631; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.45);">
      <div style="border-bottom: 2px solid #d97736; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-family: var(--font-display, serif); font-size: 19px; font-weight: 500; color: #f5f2eb;">Grautam Viagens &amp; Turismo S.A.</h2>
        <small style="color: #a6a49c; font-size: 11px;">CNPJ: 04.912.840/0001-92 · SAC: 0800 782 4100</small><br>
        <b style="font-size: 12px; color: #d97736; display: block; margin-top: 6px; letter-spacing: 0.04em;">COMPROVANTE DE VENDA DE PASSAGEM AÉREA</b>
      </div>

      <div style="margin-bottom: 14px; background: #242320; padding: 12px 14px; border-radius: 8px; border: 1px solid #383631; font-size: 12px; line-height: 1.6;">
        <div><b>LOCALIZADOR (PNR):</b> <span style="color: #d97736; font-weight: bold;">${booking.pnr}</span></div>
        <div><b>E-TICKET:</b> <span style="color: #a6a49c;">${booking.eticket}</span></div>
        <div><b>DATA DE EMISSÃO:</b> <span style="color: #a6a49c;">${new Date(booking.createdAt).toLocaleString('pt-BR')}</span></div>
        <div><b>STATUS:</b> <span style="color: #4eaa7b; font-weight: 600;">${booking.status}</span></div>
      </div>

      <div style="margin-bottom: 14px; border-top: 1px dashed #383631; padding-top: 10px; color: #a6a49c; font-size: 12px; line-height: 1.6;">
        <div><b>PASSAGEIRO:</b> <span style="color: #f5f2eb;">${booking.passengers?.[0]?.name || 'Carlos Silveira'}</span></div>
        <div><b>DOCUMENTO:</b> <span style="color: #f5f2eb;">${booking.passengers?.[0]?.document || '284.912.840-12'}</span></div>
        <div><b>VOO:</b> <span style="color: #f5f2eb;">${booking.flightNumber} (${booking.airline})</span></div>
        <div><b>ROTA:</b> <span style="color: #f5f2eb;">${booking.origin} → ${booking.destination}</span></div>
        <div><b>DATA DO VOO:</b> <span style="color: #f5f2eb;">${booking.date} às ${booking.departureTime}</span></div>
        <div><b>ASSENTO:</b> <span style="color: #d97736; font-weight: 600;">${booking.seat} (${booking.cabinClass})</span></div>
      </div>

      <div style="border-top: 1px solid #383631; border-bottom: 1px solid #383631; padding: 10px 0; margin-bottom: 14px; font-size: 12px; color: #a6a49c;">
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Tarifa Base Aérea:</span>
          <span style="color: #f5f2eb;">R$ ${fare.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Tarifa de Embarque (ANAC):</span>
          <span style="color: #f5f2eb;">R$ ${taxes.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Serviços Adicionais:</span>
          <span style="color: #f5f2eb;">R$ ${extras.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 8px; font-size: 13.5px; color: #f5f2eb; border-top: 1px dashed #383631; padding-top: 6px;">
          <span>VALOR TOTAL PAGO:</span>
          <span style="color: #4eaa7b;">R$ ${booking.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="font-size: 11px; color: #a6a49c; line-height: 1.5;">
        <div><b>FORMA DE PAGAMENTO:</b> <span style="color: #f5f2eb;">${booking.paymentMethod} (${booking.installments || '1x'})</span></div>
        <small style="display: block; margin-top: 8px; color: #73716a;">Este comprovante serve como confirmação de emissão de bilhete aéreo eletrônico em conformidade com as normas ANAC.</small>
      </div>
    </div>
  `;
}

module.exports = {
  generateReceiptHtml
};
