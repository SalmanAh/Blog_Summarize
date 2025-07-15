"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
// 1. Import and initialize Supabase client
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
// Make sure to add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local

export default function Home() {
  const [url, setUrl] = useState("")
  const [summary, setSummary] = useState(null)
  const [original, setOriginal] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState("summary")
  // Theme toggle state
  const [theme, setTheme] = useState("dark")
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Use environment variables for Gemini API key and endpoint
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Set in .env.local
  const GEMINI_ENDPOINT = process.env.NEXT_PUBLIC_GEMINI_ENDPOINT; // Set in .env.local

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSummary(null)
    setOriginal("")
    try {
      // 1. Fetch plain text from Jina.ai
      const apiUrl = `https://r.jina.ai/${encodeURIComponent(url)}`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error("Failed to fetch blog content")
      const plainText = await res.text()
      setOriginal(plainText)

      // 2. Send plain text to Gemini API for summarization
      const geminiRes = await fetch(GEMINI_ENDPOINT + `?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this blog post in clear, concise language:\n\n${plainText}`
                }
              ]
            }
          ]
        })
      })
      if (!geminiRes.ok) throw new Error("Failed to get summary from Gemini")
      const geminiData = await geminiRes.json()
      const summaryText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned."

      // 3. Send the English summary to Gemini for Urdu translation
      const urduRes = await fetch(GEMINI_ENDPOINT + `?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following summary into Urdu (keep it concise and clear):\n\n${summaryText}`
                }
              ]
            }
          ]
        })
      })
      if (!urduRes.ok) throw new Error("Failed to get Urdu translation from Gemini")
      const urduData = await urduRes.json()
      const urduText = urduData?.candidates?.[0]?.content?.parts?.[0]?.text || "No Urdu translation returned."

      setSummary({ summary: summaryText, urdu: urduText })

      // Insert into Supabase
      const { error: supabaseError } = await supabase
        .from('Summary')
        .insert([
          {
            URL: url,
            S_En: summaryText,
            S_Ur: urduText
          }
        ])
      if (supabaseError) {
        // Optionally, you can show a toast or error message
        console.error('Supabase insert error:', supabaseError)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col text-foreground transition-colors duration-700 bg-slate-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Floating theme toggle button */}
      <button
        aria-label="Toggle theme"
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
        )}
      </button>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-xl space-y-10">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className={`text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-center mb-10 drop-shadow-lg ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'bg-gradient-to-r from-blue-800 to-cyan-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent'}`}
          >
            AI Blog Summariser
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-3 items-center justify-center bg-white/90 dark:bg-slate-800/90 p-4 rounded-2xl shadow-xl backdrop-blur-md border border-slate-200 dark:border-slate-700"
          >
            <Input
              className="flex-1 px-4 py-2 rounded-lg border-2 border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all duration-300 bg-slate-50 dark:bg-slate-900 placeholder:text-slate-400 text-lg shadow-sm hover:shadow-lg hover:border-blue-200"
              placeholder="Paste blog URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full md:w-auto px-6 py-2 rounded-lg font-semibold text-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg transition-all duration-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-cyan-800 active:scale-95 active:shadow-md text-black dark:text-white"
              onClick={handleSubmit}
              disabled={loading || !url}
              type="button"
              style={{ transition: 'all 0.25s cubic-bezier(.4,0,.2,1)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                  Summarising...
                </span>
              ) : (
                "Summarise"
              )}
            </Button>
          </motion.div>
          <div className="flex justify-center mt-4">
            <Button
              className="px-6 py-2 rounded-lg font-semibold text-lg bg-gradient-to-r from-slate-700 to-blue-500 hover:from-blue-600 hover:to-cyan-500 shadow-md transition-all duration-300 text-white"
              onClick={() => router.push('/summaries')}
              type="button"
            >
              View All Summaries
            </Button>
          </div>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-center font-semibold drop-shadow">{error}</motion.p>}

          <AnimatePresence>
            {loading && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative mt-4">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-300 via-teal-200 to-slate-200 blur-lg opacity-30 animate-pulse" />
                  <Card className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-none shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="space-y-4 py-8">
                      <Skeleton className="h-7 w-1/2 rounded bg-gradient-to-r from-blue-100 via-teal-50 to-slate-100" />
                      <Skeleton className="h-5 w-full rounded bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50" />
                      <Skeleton className="h-5 w-5/6 rounded bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50" />
                      <Skeleton className="h-5 w-2/3 rounded bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50" />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
      {summary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.06, type: 'spring' }}
              >
                <div className="relative mt-4 flex flex-col gap-8 max-w-2xl mx-auto">
                  {/* English summary card */}
                  <div className="relative w-full">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-200 via-cyan-100 to-slate-100 dark:from-blue-900 dark:via-cyan-900 dark:to-slate-800 blur-lg opacity-30 hover:opacity-60 hover:blur-xl transition-all duration-500 animate-tilt" />
                    <Card className="relative bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40 hover:scale-[1.015] min-h-[340px] md:min-h-[420px] flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold font-sans tracking-tight drop-shadow text-slate-800 dark:text-white flex justify-center text-center">English Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-center">
                        <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200 transition-colors duration-300">
                          {summary.summary}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Urdu summary card */}
                  {summary.urdu && (
                    <div className="relative w-full">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-100 via-blue-100 to-slate-100 dark:from-cyan-900 dark:via-blue-900 dark:to-slate-800 blur-lg opacity-30 hover:opacity-60 hover:blur-xl transition-all duration-500 animate-tilt" />
                      <Card className="relative bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-cyan-200/40 dark:hover:shadow-cyan-900/40 hover:scale-[1.015] min-h-[340px] md:min-h-[420px] flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold font-sans tracking-tight drop-shadow text-slate-800 dark:text-white flex justify-center text-center">Urdu Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                          <div className="whitespace-pre-line text-lg leading-relaxed text-right font-noto text-slate-700 dark:text-slate-200 transition-colors duration-300">
                            {summary.urdu}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <style>{`
        .animate-tilt {
          animation: tilt 4s infinite linear;
        }
        @keyframes tilt {
          0% { transform: rotate(-1deg) scale(1.01); }
          50% { transform: rotate(1deg) scale(1.02); }
          100% { transform: rotate(-1deg) scale(1.01); }
        }
      `}</style>
    </div>
  )
}
