// Next.js automatically calls this once per process boot.
// We use it to spin up the smart-money on-chain poller in the background.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startPoller } = await import('./lib/smart-money-poller');
    startPoller();
  }
}
