import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function SummaryDetailPage(props) {
  const params = await props.params;
  const { id } = params;
  const { data, error } = await supabase
    .from('Summary')
    .select('id, URL, S_En, S_Ur, Eng_Detail, Ur_Detail, created_at')
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
    <div className="min-h-screen flex flex-col items-center bg-transparent px-4 py-16">
      <div className="w-full max-w-4xl bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <span className="inline-block p-2 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900">
              <span dangerouslySetInnerHTML={{ __html: `<svg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='24' height='24'><g clip-path='url(#a)'><path fill-rule='evenodd' clip-rule='evenodd' d='M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1' fill='#666'/></g><defs><clipPath id='a'><path fill='#fff' d='M0 0h16v16H0z'/></clipPath></defs></svg>` }} />
            </span>
            <a href={data.URL} target="_blank" rel="noopener noreferrer" className="truncate text-blue-700 dark:text-cyan-300 underline hover:text-blue-900 dark:hover:text-cyan-100 transition-colors text-base max-w-xs md:max-w-md" title={data.URL}>{data.URL}</a>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded px-2 py-1">{data.created_at && new Date(data.created_at).toLocaleDateString()}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* English Side */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-5 flex flex-col">
              <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">English Summary</h2>
              <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200 flex-1">{data.S_En}</div>
            </div>
            {data.Eng_Detail && (
              <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-5 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">English Detail</h2>
                <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200 flex-1">{data.Eng_Detail}</div>
              </div>
            )}
          </div>
          {/* Urdu Side */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-5 flex flex-col">
              <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Urdu Summary</h2>
              <div className="whitespace-pre-line text-lg leading-relaxed text-right font-noto text-slate-700 dark:text-slate-200 flex-1">{data.S_Ur}</div>
            </div>
            {data.Ur_Detail && (
              <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-5 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Urdu Detail</h2>
                <div className="whitespace-pre-line text-lg leading-relaxed text-right font-noto text-slate-700 dark:text-slate-200 flex-1">{data.Ur_Detail}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 