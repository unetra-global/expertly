/**
 * Custom Pages Router error page.
 * Overrides Next.js's built-in _error.js which imports Html from next/document
 * and causes a build-time prerender failure in App Router projects.
 */
function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <p style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '4rem' }}>
      {statusCode ? `${statusCode} — Server error` : 'An error occurred'}
    </p>
  );
}

ErrorPage.getInitialProps = ({ res, err }: {
  res?: { statusCode: number };
  err?: { statusCode?: number };
}) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
