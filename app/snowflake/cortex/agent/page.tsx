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
    <main>
      <h1>Cortex Chat</h1>
      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={sendPrompt} disabled={loading || !prompt}>
        {loading ? "Loading..." : "Send"}
      </button>

      {response?.error && <pre>{response.error}</pre>}

      {response?.sql && response?.table?.length > 0 && (
        <>
          <h2>Table Result:</h2>
          <table border={1} style={{ marginTop: 20 }}>
            <thead>
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

      {response?.text && <pre>{response.text}</pre>}
      {response?.citations && (
        <pre style={{ fontStyle: "italic" }}>{response.citations}</pre>
      )}
    </main>
  );
}
