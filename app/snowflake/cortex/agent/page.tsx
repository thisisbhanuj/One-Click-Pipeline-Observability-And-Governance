"use client";

import { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { PROMPTS, CONSTANTS } from "@/lib/constants";
import { continueConversationWithTool } from "@/app/actions/snowflake.action";

export const dynamic = "force-dynamic";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function CortexAgentChatBot() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const parsedTable = useMemo(() => {
    try {
      return response?.table ? JSON.parse(response.table) : [];
    } catch {
      return [];
    }
  }, [response?.table]);

  const chartData = useMemo(() => {
    if (!parsedTable.length) return null;
    const [firstKey, secondKey] = Object.keys(parsedTable[0]);
    return {
      labels: parsedTable.map((row: { [x: string]: any; }) => row[firstKey]),
      datasets: [
        {
          label: secondKey,
          data: parsedTable.map((row: { [x: string]: any; }) => row[secondKey]),
          backgroundColor: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
        }
      ]
    };
  }, [parsedTable]);

  const sendPrompt = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await continueConversationWithTool(prompt);
      if (res.success) setResponse(JSON.parse(res.data));
      else setResponse({ error: "Error" });
    } catch {
      setResponse({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-4">
      <div>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:border-blue-500"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={PROMPTS.TOP_SELLING_BOOK_BRANDS_TX_2003.description}
        />
        <button
          className={`w-auto p-2 border rounded-lg focus:outline-none 
            ${loading || !prompt
              ? "bg-gray-600 text-gray-200 border-gray-300 cursor-not-allowed"
              : "bg-black text-white border-gray-300 hover:bg-gray-800"}`
          }
          onClick={sendPrompt}
          disabled={loading || !prompt}
        >
          {loading ? "❄️ Snowflake Cortex Agent fetching data..." : "Send"}
        </button>
      </div>

      {response?.error && <pre>{response.error}</pre>}

      <div className="bg-white p-4 rounded-xl shadow-sm space-y-6">
        {response?.sql && parsedTable.length > 0 && (
          <>
            <h2 className="text-lg font-semibold 
              text-gray-800 border-b border-gray-200 pb-2 mb-4"
            >
              {CONSTANTS.TABLE_RESULT}
            </h2>
            <table 
              className="min-w-full border-collapse"
              border={1} 
              style={{ marginTop: 20 }}
            >
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(parsedTable[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedTable.map(
                  (row: { [s: string]: unknown; } | ArrayLike<unknown>, idx: string) => (
                    <tr key={'row_' + idx}>
                      {
                        Object.values(row).map((val, i) => (
                          <td key={'cell_' + i}>{String(val)}</td>
                        ))
                      }
                    </tr>
                ))}
              </tbody>
            </table>

            {chartData && (
              <div className="min-w-full border-collapse" 
                style={
                  { 
                    maxWidth: 600, 
                    marginTop: 40
                  }
                }
              >
                <h2 className="text-lg font-semibold 
                  text-gray-800 border-b border-gray-200 pb-2 mb-4"
                >
                  {CONSTANTS.CHART}
                </h2>
                <Bar data={chartData} />
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
