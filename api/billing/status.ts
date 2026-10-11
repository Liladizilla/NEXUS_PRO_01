export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    enabled: false,
    checkoutConfigured: false,
    verificationConfigured: false,
    message: 'Billing setup incomplete: checkout and server-side purchase verification are not connected yet.'
  });
}
