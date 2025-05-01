'use client';

import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SparklesCore } from "@/components/sparkles";
import { ArrowLeft, BarChart3, LineChart, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fetchStats = async () => {
    if (!field1 || !field2) {
      setErrorMessage("Please enter both fields");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/stats/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field1, field2 }),
      });
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setErrorMessage("Failed to fetch analysis");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black">
      <div className="relative min-h-screen antialiased overflow-hidden">
        {/* Background Sparkles */}
        <div className="h-full w-full absolute inset-0">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor={resolvedTheme === "light" ? "#000000" : "#FFFFFF"}
          />
        </div>

        {/* Error Alert */}
        {showError && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500 mx-4">
              <AlertDescription className="text-center">
                {errorMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            onClick={navigateBack}
            className="gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-4 text-black dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ENVI</span>{" "}
              Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Run statistical analysis on your data</p>
          </motion.div>

          {/* Analysis Form */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 p-8 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Field 1</label>
                <Input
                  placeholder="Field 1 (e.g. sales)"
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  className="bg-white/10 dark:bg-black/30 border-purple-500/20 focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Field 2</label>
                <Input
                  placeholder="Field 2 (e.g. date)"
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  className="bg-white/10 dark:bg-black/30 border-purple-500/20 focus:border-purple-500/50"
                />
              </div>
              <div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={fetchStats}
                    disabled={loading}
                    className={`w-full py-6 text-lg rounded-xl shadow-lg transition-all ${
                      loading
                        ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white/60 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    }`}
                  >
                    {loading ? "Analyzing..." : "Analyze"}
                  </Button>
                </motion.div>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl" />
          </motion.div>

          {/* Results Section */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Response Warnings */}
              {response.warning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      {response.warning}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Charts Section */}
              <div className="space-y-8">
                {response?.charts?.line_chart_1 && (
                  <ChartCard
                    title={response.charts.line_chart_1.title}
                    data={response.charts.line_chart_1}
                    icon={<LineChart className="h-5 w-5" />}
                  />
                )}

                {response?.charts?.line_chart_2 && (
                  <ChartCard
                    title={response.charts.line_chart_2.title}
                    data={response.charts.line_chart_2}
                    icon={<LineChart className="h-5 w-5" />}
                  />
                )}

                {response?.charts?.column_chart && (
                  <ChartCard
                    title={response.charts.column_chart.title}
                    data={response.charts.column_chart}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                )}
              </div>

              {/* Outliers Section */}
              {response?.outliers?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 p-6 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-purple-500/30"
                >
                  <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Outliers Detected
                  </h2>
                  <pre className="bg-black/30 p-4 rounded-xl text-sm overflow-x-auto text-gray-300">
                    {JSON.stringify(response.outliers, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, data, icon }: { title: string; data: any; icon?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-purple-500">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white">{title}</h3>
      </div>
      
      <div className="flex justify-center">
        <Plot
          data={[
            {
              x: data.x,
              y: data.y,
              type: data.type || 'scatter',
              mode: data.type === 'bar' ? 'none' : 'lines+markers',
              marker: { color: 'rgb(147, 51, 234)', opacity: 0.7 },
              line: { color: 'rgb(219, 39, 119)', width: 2 },
            },
          ]}
          layout={{
            width: 650,
            height: 400,
            margin: { t: 10, r: 10, b: 50, l: 50 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#d1d5db' },
            xaxis: { gridcolor: 'rgba(107,114,128,0.2)' },
            yaxis: { gridcolor: 'rgba(107,114,128,0.2)' },
            showlegend: false,
          }}
          config={{ responsive: true }}
        />
      </div>
      
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl" />
    </motion.div>
  );
}