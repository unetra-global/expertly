import { Suspense } from 'react';
import SettingsPageClient from './SettingsPageClient';

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
