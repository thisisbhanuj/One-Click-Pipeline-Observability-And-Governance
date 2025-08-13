"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function CortexAgentChatBot() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/cortex/agent", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) setResponse(data);
      else setResponse({ error: data.error ?? "Error" });
    } catch (e) {
      setResponse({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!response?.table?.length) return null;
    const labels = response.table.map((row: any) => row[Object.keys(row)[0]]);
    const values = response.table.map((row: any) => row[Object.keys(row)[1]]);
    return {
      labels,
      datasets: [
        {
          label: Object.keys(response.table[0])[1],
          data: values,
          backgroundColor: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
        },
      ],
    };
  };

  return (
    <main className="space-y-4">
      <div>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Show me the top selling brands in by total sales quantity in the state ‘TX' in the ‘Books' category in the year 2003"
        />
        <button
          className={`w-40 p-2 border rounded-lg focus:outline-none 
            ${loading || !prompt
              ? "bg-gray-600 text-gray-200 border-gray-300 cursor-not-allowed"
              : "bg-black text-white border-gray-300 hover:bg-gray-800"}`}
          onClick={sendPrompt}
          disabled={loading || !prompt}
        >
          {loading ? "❄️ Snowflake Cortex Agent is working..." : "Send"}
        </button>
      </div>

      {response?.error && <pre>{response.error}</pre>}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {response?.sql && response?.table?.length > 0 && (
        <>
          <h2>Table Result:</h2>
          <table 
            className="min-w-full border-collapse"
            border={1} style={{ marginTop: 20 }}>
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(response.table[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {response.table.map((row: any, idx: number) => (
                <tr key={'row_'+idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={'row_'+i}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {response.table[0] && Object.keys(response.table[0]).length > 1 && (
            <div style={{ maxWidth: 600, marginTop: 40 }}>
              <h2>Chart:</h2>
              <Bar data={getChartData()!} />
            </div>
          )}
        </>
        )}
      </div>

      {response?.text && <pre>{response.text}</pre>}
      {response?.citations && (
        <pre style={{ fontStyle: "italic" }}>{response.citations}</pre>
      )}
    </main>
  );
}
