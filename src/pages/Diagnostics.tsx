import { Diagnostics } from '../components/Diagnostics'

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Diagnostics />
      </div>
    </div>
  )
}
