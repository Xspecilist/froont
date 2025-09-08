import React, { useState, useEffect } from "react";
import "./App.css";
import html2pdf from "html2pdf.js";


function Summary({ text, limit = 300 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;
  const displayText = expanded || !isLong ? text : text.slice(0, limit) + "...";


  return (
    <div className="summary">
      <p>{displayText}</p>
      {isLong && (
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}


function SnippetOneLine({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;


  return (
    <div>
      {!expanded ? (
        <div className="one-line-row">
          <div className="one-line-text">{text}</div>
          <button className="toggle-btn small" onClick={() => setExpanded(true)}> 
            Show more
          </button>
        </div>
      ) : (
        <div>
          <Summary text={text} limit={1000} />
          <button className="toggle-btn small" onClick={() => setExpanded(false)}>
            Show less
          </button>
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [combinedSummary, setCombinedSummary] = useState("");
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("US");
  const [uiLang, setUiLang] = useState("en-US");


  useEffect(() => {
    const raw = localStorage.getItem("ai_recent_searches");
    if (raw) setRecent(JSON.parse(raw));
  }, []);


  useEffect(() => {
    localStorage.setItem("ai_recent_searches", JSON.stringify(recent));
  }, [recent]);


  const addToRecent = (q, results) => {
    const entry = {
      query: q,
      time: new Date().toISOString(),
      topResultTitle: results && results[0] ? results[0].title : "",
    };
    const filtered = [entry, ...recent.filter((r) => r.query !== q)].slice(0, 8);
    setRecent(filtered);
  };


  const handleSearch = async (q = null) => {
    const searchQuery = q ?? query;
    if (!searchQuery) return;
    try {
      setLoading(true);
      const res = await fetch(
    `https://non-prev-wool-territory.trycloudflare.com/search_summary?q=${encodeURIComponent(searchQuery)}&country=${country}&ui_lang=${uiLang}`
    );
      const data = await res.json();
      setResults(data.results || []);
      setCombinedSummary(data.combined_summary || "");
      addToRecent(searchQuery, data.results || []);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleRecentClick = (entry) => {
    setQuery(entry.query);
    handleSearch(entry.query);
    setRecent((r) => [entry, ...r.filter((x) => x.query !== entry.query)].slice(0, 8));
  };


  const handleExportPdf = () => {
    const element = document.getElementById("print-area");
    if (!element) return alert("Nothing to export");


    const opt = {
      margin: 12,
      filename: "research-summary.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };


    html2pdf().set(opt).from(element).save();
  };


  return (
    <div className="app-container">
      <aside className="sidebar">
        <button className="sidebar-btn">+</button>
        <div className="sidebar-icons">
          <div className="icon-circle" />
          <div className="icon-circle" />
        </div>
        <div className="avatar" />
      </aside>


      <main className="main-content">
        {/* Centered header column: title, selects, search, export */}
        <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <h1 className="title" style={{ textAlign: "center", marginBottom: 6 }}>
            "-AI Research Agent-" <span className="highlight">"-BRAVE API & DistilBART-"</span>
          </h1>

          {/* Increased vertical gap between title and dropdowns */}
          <div
            className="search-options"
            style={{
              display: "flex",
              gap: 22,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="visually-hidden">Country</span>
              <select
                className="select-green"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                aria-label="Country"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="BE">🇧🇪 Belgium</option>
                <option value="IN">🇮🇳 India</option>
                <option value="FR">🇫🇷 France</option>
                <option value="DE">🇩🇪 Germany</option>
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="visually-hidden">UI language</span>
              <select
                className="select-green"
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value)}
                aria-label="UI language"
              >
                <option value="en-US">🌐 English (US)</option>
                <option value="fr-FR">🌐 French (FR)</option>
                <option value="de-DE">🌐 German (DE)</option>
                <option value="in-US">🌐 Hindi (IN)</option>
                <option value="es-ES">🌐 Spanish (ES)</option>
              </select>
            </label>
          </div>


          {/* increased gap between dropdown and search */}
          <div
            className="search-bar"
            style={{
              marginTop: 18,
              width: "100%",
              maxWidth: 820,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Ask anything or start your research..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ minWidth: 560 }}
            />
            <button onClick={() => handleSearch()} className="search-btn">
              Search
            </button>
          </div>


          {/* increase gap between search and export buttons and center them */}
          <div className="export-buttons" style={{ marginTop: 22, display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={handleExportPdf} className="btn-primary">
              Export PDF
            </button>
            <button className="btn-primary">Export Word</button>
          </div>
        </header>


        <div className="quick-results" style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          {loading ? (
            <div className="thinking">
              Thinking<span className="dots" />
            </div>
          ) : results.length === 0 ? (
            <div className="no-results">No results yet — run a search.</div>
          ) : null}
        </div>


        {combinedSummary && (
          <div id="print-area" className="combined-summary" style={{ marginTop: 26 }}>
            <h3>Combined Summary</h3>
            <Summary text={combinedSummary} limit={500} />
            {results[0] && (
              <div style={{ marginTop: 10 }}>
                <a href={results[0].url}>{results[0].url}</a>
              </div>
            )}
          </div>
        )}


        <div className="results" style={{ marginTop: 26 }}>
          {results.map((item, idx) => (
            <article key={idx} className="result-card">
              <a className="result-title" href={item.url} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <p className="result-description">{item.description}</p>
              <div style={{ marginTop: 10 }}>
                <SnippetOneLine text={item.description || "No summary available."} />
                <div style={{ marginTop: 8 }}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#f43f5e", fontSize: 13 }}>
                    {item.url}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>


        <section className="recent-searches" style={{ marginTop: 34 }}>
          <h2>Recent Searches</h2>
          <div className="search-cards" style={{ marginTop: 12 }}>
            {recent.length === 0 && <div className="no-results">No recent searches</div>}
            {recent.map((r, i) => (
              <div key={i} className="search-card" onClick={() => handleRecentClick(r)}>
                <div className="card-title">{r.query}</div>
                <div className="card-meta">{new Date(r.time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>


        <footer className="footer">Powered by advanced AI research capabilities</footer>
      </main>
    </div>
  );
}
