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
import { TypingAnimation } from "@/components/magicui/typing-animation";
import FlippingCard from '../components/ui/flipping-card';

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
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", true) // Force dark mode
    }
  }, [])

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

      // 2b. Get detailed English description
      const detailEnRes = await fetch(GEMINI_ENDPOINT + `?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Provide a detailed explanation of this blog post in clear, descriptive English:\n\n${plainText}`
                }
              ]
            }
          ]
        })
      })
      if (!detailEnRes.ok) throw new Error("Failed to get English detail from Gemini")
      const detailEnData = await detailEnRes.json()
      const detailEnText = detailEnData?.candidates?.[0]?.content?.parts?.[0]?.text || "No English detail returned."
      //cls
      // console.log('English Detail:', detailEnText)

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

      // 3b. Translate the English detail to Urdu
      const detailUrRes = await fetch(GEMINI_ENDPOINT + `?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following detailed explanation into Urdu (keep it descriptive and clear):\n\n${detailEnText}`
                }
              ]
            }
          ]
        })
      })
      if (!detailUrRes.ok) throw new Error("Failed to get Urdu detail from Gemini")
      const detailUrData = await detailUrRes.json()
      const detailUrText = detailUrData?.candidates?.[0]?.content?.parts?.[0]?.text || "No Urdu detail returned."
      console.log('Urdu Detail:', detailUrText)

      setSummary({ summary: summaryText, urdu: urduText, detailEn: detailEnText, detailUr: detailUrText })

      // Insert into Supabase
      const { error: supabaseError } = await supabase
        .from('Summary')
        .insert([
          {
            URL: url,
            S_En: summaryText,
            S_Ur: urduText,
            Eng_Detail: detailEnText,
            Ur_Detail: detailUrText
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
      className="min-h-screen flex flex-col text-foreground transition-colors duration-700 bg-transparent"
    >
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 bg-transparent">
        {/* Hero/Intro Section */}
        <section className="w-full max-w-2xl mx-auto text-center mb-12">
          <div className="flex flex-col items-center gap-4">
            <TypingAnimation className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight drop-shadow-lg bg-gradient-to-r from-blue-800 to-cyan-600 bg-clip-text text-transparent dark:from-blue-800 dark:to-cyan-400 mb-2">AI Blog Summarizer</TypingAnimation>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-xl mx-auto">Summarize any blog post instantly in clear English and Urdu. Powered by Google Gemini AI and Supabase. Save, view, and share your summaries with ease!</p>
          </div>
        </section>
        {/* How it works section - use FlippingCard */}
        <section className="mt-16">
          <h2 className="text-4xl font-bold mb-8 text-center">How it works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <FlippingCard
              number={1}
              icon={<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>}
              title="Paste Blog"
              detail="Paste your blog content into the input box to get started."
              badge="Step 1"
              footer="Easy start"
            />
            <FlippingCard
              number={2}
              icon={<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
              title="Summarize"
              detail="Click Summarize and let the AI generate concise summaries in English and Urdu."
              badge="Step 2"
              footer="AI powered"
            />
            <FlippingCard
              number={3}
              icon={<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>}
              title="View & Copy"
              detail="View your summaries and copy them for use anywhere you like."
              badge="Step 3"
              footer="Save & share"
            />
          </div>
        </section>
        <div className="mt-20" />
        <div className="w-full max-w-xl space-y-10">
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
            <div className="flex items-center">
            <Button
              onClick={handleSubmit}
              disabled={loading || !url}
              type="button"
              >
                {loading ? "Summarising..." : "Summarise"}
            </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center mt-4"
          >
            <Button
              onClick={() => router.push('/summaries')}
              type="button"
            >
              View All Summaries
            </Button>
          </motion.div>
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
                  {/* English detail card */}
                  {summary.detailEn && (
                    <div className="relative w-full">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-100 via-cyan-50 to-slate-100 dark:from-blue-800 dark:via-cyan-800 dark:to-slate-800 blur-lg opacity-30 hover:opacity-60 hover:blur-xl transition-all duration-500 animate-tilt" />
                      <Card className="relative bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40 hover:scale-[1.015] flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold font-sans tracking-tight drop-shadow text-slate-800 dark:text-white flex justify-center text-center">English Detail</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                          <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200 transition-colors duration-300">
                            {summary.detailEn}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
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
                  {/* Urdu detail card */}
                  {summary.detailUr && (
                    <div className="relative w-full">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-50 via-blue-50 to-slate-100 dark:from-cyan-800 dark:via-blue-800 dark:to-slate-800 blur-lg opacity-30 hover:opacity-60 hover:blur-xl transition-all duration-500 animate-tilt" />
                      <Card className="relative bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-cyan-200/40 dark:hover:shadow-cyan-900/40 hover:scale-[1.015] flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold font-sans tracking-tight drop-shadow text-slate-800 dark:text-white flex justify-center text-center">Urdu Detail</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                          <div className="whitespace-pre-line text-lg leading-relaxed text-right font-noto text-slate-700 dark:text-slate-200 transition-colors duration-300">
                            {summary.detailUr}
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
