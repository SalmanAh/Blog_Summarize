import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function SummaryDetailPage({ params }) {
  const { id } = params
  const { data, error } = await supabase
    .from('Summary')
    .select('id, URL, S_En, S_Ur, created_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg p-8 mt-20">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Summary Not Found</h1>
          <p className="text-slate-600 dark:text-slate-300">The requested summary does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-16">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800 dark:text-cyan-200">Summary Details</h1>
        <div className="mb-4">
          <span className="font-semibold text-slate-700 dark:text-slate-200">URL: </span>
          <a href={data.URL} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-cyan-300 underline break-all">{data.URL}</a>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Date: </span>
          <span className="text-slate-600 dark:text-slate-400">{data.created_at && new Date(data.created_at).toLocaleDateString()}</span>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">English Summary</h2>
          <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 rounded p-4">
            {data.S_En}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Urdu Summary</h2>
          <div className="whitespace-pre-line text-lg leading-relaxed text-right font-noto text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 rounded p-4">
            {data.S_Ur}
          </div>
        </div>
      </div>
    </div>
  )
} 