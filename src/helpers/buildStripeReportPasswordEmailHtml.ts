export function buildStripeReportPasswordEmailHtml(period: string, password: string): string {
  return `
<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#27272a">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
          <tr><td style="background:#18181b;padding:24px 32px">
            <table role="presentation" cellspacing="0" cellpadding="0"><tr>
              <td><img src="cid:wolfmed-logo" width="52" height="52" alt="Wolfmed Edukacja" style="display:block;border-radius:50%;border:2px solid #fca5a5"></td>
              <td style="padding-left:14px;color:#fff;font-size:20px;font-weight:700;letter-spacing:.5px">WOLFMED <span style="font-weight:400;color:#d4d4d8">EDUKACJA</span></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:32px">
            <p style="margin:0 0 8px;color:#e11d48;font-size:12px;font-weight:700;letter-spacing:1px">Dane dostępowe</p>
            <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3">Hasło do raportu Stripe</h1>
            <p style="margin:0 0 20px;line-height:1.6">Hasło do raportu za <strong>${period}</strong>:</p>
            <div style="background:#f4f4f5;border:1px solid #d4d4d8;border-radius:10px;padding:18px;text-align:center;font-family:Consolas,monospace;font-size:20px;font-weight:700;letter-spacing:1px">${password}</div>
            <p style="margin:24px 0 0;line-height:1.6">Pozdrawiam,<br><strong>Wolfmed Edukacja</strong></p>
          </td></tr>
          <tr><td style="border-top:1px solid #e4e4e7;padding:18px 32px;color:#71717a;font-size:12px">Wolfmed Edukacja · wolfmed-edukacja.pl</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}
