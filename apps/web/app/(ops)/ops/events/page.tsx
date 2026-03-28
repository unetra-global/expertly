import { Suspense } from 'react';
import EventsPageClient from './EventsPageClient';

export default function EventsPage() {
  return (
    <Suspense>
      <EventsPageClient />
    </Suspense>
  );
}
