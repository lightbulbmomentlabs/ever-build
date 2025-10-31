import { redirect } from 'next/navigation';

/**
 * Settings Page
 *
 * Redirects to the profile settings tab by default.
 */
export default function SettingsPage() {
  redirect('/settings/profile');
}
