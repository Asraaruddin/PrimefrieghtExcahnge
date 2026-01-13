// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}