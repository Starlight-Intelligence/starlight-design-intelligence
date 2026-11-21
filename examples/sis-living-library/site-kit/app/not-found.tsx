import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="ks-page ks-page--narrow">
      <h1 className="ks-claim ks-claim--page">This page did not run.</h1>
      <p className="ks-lede">The address may have changed. The docs and pricing are still here.</p>
      <Link className="ks-link" href="/docs">
        Open the docs
      </Link>
    </div>
  );
}
