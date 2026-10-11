export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    enabled: false,
    checkoutConfigured: false,
    verificationConfigured: false,
    message: 'Billing is unavailable right now. Checkout and secure server-side purchase verification are not configured, so no payment can be taken and no paid plan can be activated.'
  });
}
