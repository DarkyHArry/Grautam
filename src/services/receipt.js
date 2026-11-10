// Gerador de Recibo Fiscal e Comprovante de Pagamento - Grautam Viagens

function generateReceiptHtml(booking) {
  const fare = Math.round((booking.total * 0.82) * 100) / 100;
  const taxes = Math.round((booking.total * 0.12) * 100) / 100;
  const extras = Math.round((booking.total - fare - taxes) * 100) / 100;

  return `
    <div class="receipt-document" style="font-family: monospace; padding: 24px; color: #fcfaff; background: #160228; border: 1px solid #3e126a; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
      <div style="border-bottom: 2px solid #e6004c; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 18px; color: #fcfaff;">GRAUTAM VIAGENS &amp; TURISMO S.A.</h2>
        <small style="color: #c2b4d8;">CNPJ: 04.912.840/0001-92 · SAC: 0800 782 4100</small><br>
        <b style="font-size: 13px; color: #e6004c; display: block; margin-top: 4px;">COMPROVANTE DE VENDA DE PASSAGEM AÉREA</b>
      </div>

      <div style="margin-bottom: 14px; background: #1f0538; padding: 12px; border-radius: 8px; border: 1px solid #2d0b4e;">
        <div><b>LOCALIZADOR (PNR):</b> <span style="color: #e6004c; font-weight: bold;">${booking.pnr}</span></div>
        <div><b>E-TICKET:</b> <span style="color: #c2b4d8;">${booking.eticket}</span></div>
        <div><b>DATA DE EMISSÃO:</b> <span style="color: #c2b4d8;">${new Date(booking.createdAt).toLocaleString('pt-BR')}</span></div>
        <div><b>STATUS:</b> <span style="color: #2fd080; font-weight: bold;">${booking.status}</span></div>
      </div>

      <div style="margin-bottom: 14px; border-top: 1px dashed #3e126a; padding-top: 10px; color: #c2b4d8;">
        <div><b>PASSAGEIRO:</b> <span style="color: #fcfaff;">${booking.passengers?.[0]?.name || 'Carlos Silveira'}</span></div>
        <div><b>DOCUMENTO:</b> <span style="color: #fcfaff;">${booking.passengers?.[0]?.document || '284.912.840-12'}</span></div>
        <div><b>VOO:</b> <span style="color: #fcfaff;">${booking.flightNumber} (${booking.airline})</span></div>
        <div><b>ROTA:</b> <span style="color: #fcfaff;">${booking.origin} → ${booking.destination}</span></div>
        <div><b>DATA DO VOO:</b> <span style="color: #fcfaff;">${booking.date} às ${booking.departureTime}</span></div>
        <div><b>ASSENTO:</b> <span style="color: #e6004c; font-weight: bold;">${booking.seat} (${booking.cabinClass})</span></div>
      </div>

      <div style="border-top: 1px solid #3e126a; border-bottom: 1px solid #3e126a; padding: 10px 0; margin-bottom: 14px; color: #c2b4d8;">
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Tarifa Base Aérea:</span>
          <span style="color: #fcfaff;">R$ ${fare.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Tarifa de Embarque (ANAC):</span>
          <span style="color: #fcfaff;">R$ ${taxes.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">
          <span>Serviços Adicionais:</span>
          <span style="color: #fcfaff;">R$ ${extras.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 8px; font-size: 14px; color: #fcfaff; border-top: 1px dashed #3e126a; padding-top: 6px;">
          <span>VALOR TOTAL PAGO:</span>
          <span style="color: #2fd080;">R$ ${booking.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="font-size: 11px; color: #c2b4d8;">
        <div><b>FORMA DE PAGAMENTO:</b> <span style="color: #fcfaff;">${booking.paymentMethod} (${booking.installments || '1x'})</span></div>
        <small style="display: block; margin-top: 8px; color: #8573a2;">Este comprovante serve como confirmação de emissão de bilhete aéreo eletrônico em conformidade com as normas ANAC.</small>
      </div>
    </div>
  `;
}

module.exports = {
  generateReceiptHtml
};
