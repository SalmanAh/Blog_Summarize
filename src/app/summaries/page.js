"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SummariesPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
  const { data, error } = await supabase
    .from('Summary')
    .select('id, URL, created_at')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setData(data || []);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-800 dark:text-cyan-200">All Blog Searches</h1>
      {error && <div className="text-red-500 mb-4">Failed to load summaries.</div>}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {data && data.length > 0 ? (
            data.map(row => (
            <div key={row.id} className="flex flex-col bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-blue-200/40 dark:hover:shadow-cyan-900/40 transition-shadow duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block p-2 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900">
                  <img src="/page.svg" alt="Book" className="w-10 h-10 mx-auto mb-4 opacity-80" />
                </span>
                <span className="truncate text-slate-800 dark:text-slate-200 text-base max-w-xs" title={row.URL}>{row.URL}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded px-2 py-1">{row.created_at && new Date(row.created_at).toLocaleDateString()}</span>
                <button
                  className="summaries-btn"
                  onClick={() => router.push(`/summaries/${row.id}`)}
                  aria-label={`View summary for ${row.URL}`}
                >
                  View
                </button>
              </div>
            </div>
            ))
          ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <span className="mb-4">
              <img src="/page.svg" alt="Book" className="w-12 h-12 mx-auto opacity-60" />
            </span>
            <p className="text-slate-500 dark:text-slate-300 text-lg">No summaries found. Start by summarizing a blog!</p>
          </div>
          )}
      </div>
    </div>
  );
} 
