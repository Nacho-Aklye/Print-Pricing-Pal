import type { PhotoQuote, PhotoBranding } from "./photo-types";
import { calcQuoteTotal, formatCLP } from "./photo-types";

export function generateQuotePDF(quote: PhotoQuote, branding: PhotoBranding): void {
  const { subtotal, discountAmount, total } = calcQuoteTotal(quote);
  const date = new Date(quote.createdAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const primaryColor = branding.primaryColor || "#2d8a6e";
  const secondaryColor = branding.secondaryColor || "#1a1a2e";
  const businessName = branding.businessName || "Mi Estudio";

  // Build HTML for PDF
  const lines: string[] = [];

  const itemRows: string[] = [];

  if (quote.type === "package" && quote.packageName) {
    itemRows.push(`<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;">Paquete: ${quote.packageName}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">1</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCLP(quote.baseRate)}</td></tr>`);
  } else if (quote.baseRate > 0) {
    itemRows.push(`<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;">Tarifa base de sesión</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">1</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCLP(quote.baseRate)}</td></tr>`);
  }

  for (const extra of quote.extras) {
    itemRows.push(`<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;">${extra.name}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${extra.quantity}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCLP(extra.price * extra.quantity)}</td></tr>`);
  }

  for (const item of quote.items) {
    itemRows.push(`<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;">${item.description}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCLP(item.unitPrice * item.quantity)}</td></tr>`);
  }

  const logoHtml = branding.logoDataUrl
    ? `<img src="${branding.logoDataUrl}" style="max-height:60px;max-width:180px;object-fit:contain;" />`
    : `<div style="font-size:28px;font-weight:700;color:${primaryColor};">${businessName}</div>`;

  const contactParts = [
    branding.phone && `📞 ${branding.phone}`,
    branding.email && `✉️ ${branding.email}`,
    branding.website && `🌐 ${branding.website}`,
    branding.socialMedia && `📱 ${branding.socialMedia}`,
  ].filter(Boolean);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #333; }
  @page { size: letter; margin: 0; }
</style>
</head><body>
<div style="max-width:800px;margin:0 auto;padding:48px 40px;">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:3px solid ${primaryColor};">
    <div>
      ${logoHtml}
      ${branding.tagline ? `<div style="font-size:13px;color:#666;margin-top:4px;">${branding.tagline}</div>` : ""}
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:700;color:${secondaryColor};">COTIZACIÓN</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${date}</div>
      <div style="font-size:11px;color:#aaa;margin-top:2px;">Nº ${quote.id.slice(-6).toUpperCase()}</div>
    </div>
  </div>

  <!-- Client info -->
  <div style="background:${primaryColor}11;border-radius:8px;padding:16px 20px;margin-bottom:32px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${primaryColor};font-weight:600;margin-bottom:8px;">Cliente</div>
    <div style="font-size:16px;font-weight:600;">${quote.clientName || "—"}</div>
    ${quote.clientEmail ? `<div style="font-size:13px;color:#666;margin-top:2px;">${quote.clientEmail}</div>` : ""}
  </div>

  <!-- Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:${secondaryColor};color:white;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Concepto</th>
        <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cant.</th>
        <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Monto</th>
      </tr>
    </thead>
    <tbody style="font-size:14px;">
      ${itemRows.join("\n")}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
    <div style="width:260px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;"><span>Subtotal</span><span>${formatCLP(subtotal)}</span></div>
      ${quote.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:${primaryColor};"><span>Descuento (${quote.discount}%)</span><span>-${formatCLP(discountAmount)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:700;border-top:2px solid ${primaryColor};margin-top:4px;">
        <span>Total</span><span style="color:${primaryColor};">${formatCLP(total)}</span>
      </div>
    </div>
  </div>

  ${quote.notes ? `
  <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:32px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;margin-bottom:8px;">Notas</div>
    <div style="font-size:13px;line-height:1.6;color:#555;">${quote.notes.replace(/\n/g, "<br>")}</div>
  </div>` : ""}

  <!-- Footer -->
  <div style="border-top:1px solid #eee;padding-top:20px;text-align:center;">
    <div style="font-size:14px;font-weight:600;color:${primaryColor};margin-bottom:6px;">${businessName}</div>
    <div style="font-size:12px;color:#888;">${contactParts.join(" · ")}</div>
  </div>
</div>
</body></html>`;

  // Open in new window for printing/saving as PDF
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }
}
