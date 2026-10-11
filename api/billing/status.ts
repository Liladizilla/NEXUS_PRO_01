/** Billing is deliberately disabled until provider verification is implemented. */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    enabled: false,
    checkoutConfigured: false,
    verificationConfigured: false,
    message: 'Billing setup incomplete: checkout and server-side purchase verification are not connected yet.'
  });
}
