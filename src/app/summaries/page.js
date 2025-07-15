export const dynamic = 'force-dynamic';
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function SummariesPage() {
  // Fetch all summaries from Supabase
  const { data, error } = await supabase
    .from('Summary')
    .select('id, URL, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-800 dark:text-cyan-200">All Blog Searches</h1>
      {error && <div className="text-red-500 mb-4">Failed to load summaries.</div>}
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg p-6">
        <ul className="space-y-4">
          {data && data.length > 0 ? (
            data.map(row => (
              <li key={row.id}>
                <Link
                  href={`/summaries/${row.id}`}
                  className="text-blue-700 dark:text-cyan-300 underline hover:text-blue-900 dark:hover:text-cyan-100 transition-colors text-lg"
                >
                  {row.URL}
                </Link>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{row.created_at && new Date(row.created_at).toLocaleDateString()}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500 text-center">No summaries found.</li>
          )}
        </ul>
      </div>
    </div>
  )
} 
