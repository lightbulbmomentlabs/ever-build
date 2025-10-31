/**
 * Auth Layout
 *
 * Layout for authentication pages (sign-in, sign-up)
 * Uses a minimal layout without app navigation
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
