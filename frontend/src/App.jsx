import React, { useState, useMemo, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Error Toast Component
function ErrorToast({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: isVisible ? "20px" : "-100px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      padding: "14px 20px",
      borderRadius: "10px",
      boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
      fontSize: "14px",
      fontWeight: "500",
      transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      maxWidth: "90vw",
      textAlign: "center",
      backdropFilter: "blur(10px)"
    }}>
      ⚠️ {message}
    </div>
  );
}

// Loading Progress Component
function LoadingProgress({ stage, progress }) {
  const stages = [
    { name: "structure", label: "Generating Structure", icon: "🗺️" },
    { name: "content", label: "Writing Content", icon: "📝" },
    { name: "quizzes", label: "Creating Quizzes", icon: "❓" }
  ];

  const currentStageIndex = stages.findIndex(s => s.name === stage);

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
      background: "rgba(15, 23, 42, 0.98)",
      padding: "32px",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      minWidth: "400px"
    }}>
      <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "600", color: "#fff", textAlign: "center" }}>
        Building Your Learning Path
      </h3>

      <div style={{ marginBottom: "24px" }}>
        {stages.map((s, idx) => {
          const isActive = idx === currentStageIndex;
          const isComplete = idx < currentStageIndex;

          return (
            <div key={s.name} style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: isComplete ? "#10b981" : isActive ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginRight: "16px",
                transition: "all 0.3s"
              }}>
                {isComplete ? "✓" : s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isActive ? "#fff" : isComplete ? "#10b981" : "#64748b",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "14px",
                  marginBottom: "4px"
                }}>
                  {s.label}
                </div>
                {isActive && (
                  <div style={{
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "2px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "#3b82f6",
                      transition: "width 0.3s",
                      boxShadow: "0 0 8px #3b82f6"
                    }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "13px"
      }}>
        This may take 30-60 seconds
      </div>
    </div>
  );
}

function solarSystemLayout(nodes, links) {
  const levelRadius = { 0: 0, 1: 250, 2: 500, 3: 750, 4: 1000 };
  const adjacency = {};
  const inDegree = {};
  nodes.forEach(node => {
    adjacency[node.id] = [];
    inDegree[node.id] = 0;
  });

  links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    adjacency[sourceId].push(targetId);
    inDegree[targetId]++;
  });

  const levelNodes = {};
  nodes.forEach(node => {
    if (!levelNodes[node.level]) levelNodes[node.level] = [];
    levelNodes[node.level].push(node);
  });

  Object.keys(levelNodes).forEach(level => {
    levelNodes[level].sort((a, b) => {
      const aDeps = inDegree[a.id];
      const bDeps = inDegree[b.id];
      if (aDeps !== bDeps) return aDeps - bDeps;
      return a.id.localeCompare(b.id);
    });
  });

  return nodes.map(node => {
    if (node.level === 0) return { ...node, fx: 0, fy: 0 };
    const nodesAtLevel = levelNodes[node.level];
    const nodeIndex = nodesAtLevel.indexOf(node);
    const totalNodesAtLevel = nodesAtLevel.length;
    const radius = levelRadius[node.level];
    const angle = (nodeIndex / totalNodesAtLevel) * 2 * Math.PI - Math.PI / 2;
    return { ...node, fx: radius * Math.cos(angle), fy: radius * Math.sin(angle) };
  });
}

export default function App() {
  const [view, setView] = useState("intro");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("structure");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [savedGraphs, setSavedGraphs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [nodeContent, setNodeContent] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isStorageAvailable = () => typeof window !== 'undefined' && window.storage;

  useEffect(() => {
    if (isStorageAvailable()) loadSavedGraphs();
  }, []);

  const loadSavedGraphs = async () => {
    if (!isStorageAvailable()) return;
    try {
      const result = await window.storage.list('graph:');
      if (result && result.keys) {
        const graphs = [];
        for (const key of result.keys) {
          try {
            const data = await window.storage.get(key);
            if (data && data.value) graphs.push(JSON.parse(data.value));
          } catch (err) {
            console.error(`Error loading graph ${key}:`, err);
          }
        }
        setSavedGraphs(graphs.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      setSavedGraphs([]);
    }
  };

  const saveCurrentGraph = async (topicName) => {
    const graphId = `graph:${Date.now()}`;
    const graphState = {
      id: graphId,
      topic: topicName,
      timestamp: Date.now(),
      nodes: graphData.nodes,
      links: graphData.links,
      nodeContent: nodeContent
    };

    if (!isStorageAvailable()) {
      setActiveTabId(graphId);
      setSavedGraphs(prev => [graphState, ...prev]);
      return;
    }

    try {
      await window.storage.set(graphId, JSON.stringify(graphState));
      await loadSavedGraphs();
      setActiveTabId(graphId);
    } catch (error) {
      console.error('Error saving graph:', error);
      setActiveTabId(graphId);
      setSavedGraphs(prev => [graphState, ...prev]);
    }
  };

  const loadGraph = async (graphId) => {
    if (!isStorageAvailable()) {
      const graph = savedGraphs.find(g => g.id === graphId);
      if (graph) {
        setGraphData({ nodes: graph.nodes, links: graph.links });
        setNodeContent(graph.nodeContent);
        setTopic(graph.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
      return;
    }

    try {
      const result = await window.storage.get(graphId);
      if (result && result.value) {
        const graphState = JSON.parse(result.value);
        setGraphData({ nodes: graphState.nodes, links: graphState.links });
        setNodeContent(graphState.nodeContent);
        setTopic(graphState.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
    } catch (error) {
      console.error('Error loading graph:', error);
      const graph = savedGraphs.find(g => g.id === graphId);
      if (graph) {
        setGraphData({ nodes: graph.nodes, links: graph.links });
        setNodeContent(graph.nodeContent);
        setTopic(graph.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
    }
  };

  const deleteGraph = async (graphId) => {
    if (!isStorageAvailable()) {
      setSavedGraphs(prev => prev.filter(g => g.id !== graphId));
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
      return;
    }

    try {
      await window.storage.delete(graphId);
      await loadSavedGraphs();
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
    } catch (error) {
      console.error('Error deleting graph:', error);
      setSavedGraphs(prev => prev.filter(g => g.id !== graphId));
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
    }
  };

  const fetchGraphDataFromAPI = async (topicName) => {
    try {
      // Stage 1: Generate structure
      setLoadingStage("structure");
      setLoadingProgress(0);

      const structureResponse = await fetch('https://sphere-backend-gsoo.onrender.com/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName })
      });

      if (!structureResponse.ok) {
        throw new Error(`Structure generation failed: ${structureResponse.status}`);
      }

      const structureData = await structureResponse.json();
      setLoadingProgress(100);

      // Stage 2: Generate content
      setLoadingStage("content");
      setLoadingProgress(0);

      const contentResponse = await fetch('https://sphere-backend-gsoo.onrender.com/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topicName,
          nodes: structureData.nodes 
        })
      });

      if (!contentResponse.ok) {
        throw new Error(`Content generation failed: ${contentResponse.status}`);
      }

      const contentData = await contentResponse.json();
      setLoadingProgress(100);

      // Stage 3: Generate quizzes
      setLoadingStage("quizzes");
      setLoadingProgress(0);

      const quizzesResponse = await fetch('https://sphere-backend-gsoo.onrender.com/api/generate-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topicName,
          nodes: structureData.nodes,
          content: contentData.nodeContent
        })
      });

      if (!quizzesResponse.ok) {
        throw new Error(`Quiz generation failed: ${quizzesResponse.status}`);
      }

      const quizzesData = await quizzesResponse.json();
      setLoadingProgress(100);

      // Combine all data
      const finalNodeContent = {};
      Object.keys(contentData.nodeContent).forEach(nodeId => {
        finalNodeContent[nodeId] = {
          content: contentData.nodeContent[nodeId],
          quiz: quizzesData.nodeQuizzes[nodeId]
        };
      });

      return {
        nodes: structureData.nodes || [],
        links: structureData.links || [],
        nodeContent: finalNodeContent
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw error;
    }
  };

  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setLoadingStage("structure");
    setLoadingProgress(0);
    setError(null);

    try {
      const data = await fetchGraphDataFromAPI(topic);

      if (!data.nodes || data.nodes.length === 0) {
        throw new Error('No data received from API');
      }

      const laidOut = solarSystemLayout(data.nodes, data.links);
      setGraphData({ nodes: laidOut, links: data.links });
      setNodeContent(data.nodeContent);
      await saveCurrentGraph(topic);
      setView("graph");
    } catch (error) {
      console.error('Error generating graph:', error);
      setError(`Failed to generate graph: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    if (!node.unlocked) {
      setError("🔒 Complete previous topics first");
      return;
    }

    if (!nodeContent[node.id]) {
      setError("Content not available for this node");
      return;
    }

    setSelectedNode(node);
    setScore(null);
    setSelectedAnswer(null);
  };

  const unlockNodes = async (parent, score) => {
    const threshold = 0;
    const nodeParents = {};
    graphData.nodes.forEach(n => {
      nodeParents[n.id] = [];
    });

    graphData.links.forEach(l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      if (!nodeParents[targetId].includes(sourceId)) {
        nodeParents[targetId].push(sourceId);
      }
    });

    const nodesWithCompletion = graphData.nodes.map(n => ({
      ...n,
      quiz_completed: n.id === parent.id ? true : n.quiz_completed
    }));

    const childIds = graphData.links
      .filter(l => (l.source.id || l.source) === parent.id)
      .map(l => l.target.id || l.target);

    const updatedNodes = nodesWithCompletion.map(n => {
      const isChild = childIds.includes(n.id);
      let shouldUnlock = false;
      if (isChild && !n.unlocked && score >= threshold) {
        const parents = nodeParents[n.id];
        const allParentsCompleted = parents.every(parentId => {
          const parentNode = nodesWithCompletion.find(node => node.id === parentId);
          return parentNode && parentNode.quiz_completed;
        });
        shouldUnlock = allParentsCompleted;
      }

      return {
        id: n.id,
        label: n.label,
        level: n.level,
        unlocked: shouldUnlock ? true : n.unlocked,
        quiz_completed: n.quiz_completed,
        fx: n.fx,
        fy: n.fy
      };
    });

    const cleanedLinks = graphData.links.map(l => ({
      source: l.source.id || l.source,
      target: l.target.id || l.target,
    }));

    const newGraphData = {
      nodes: updatedNodes,
      links: cleanedLinks,
    };

    setGraphData(newGraphData);

    if (activeTabId && isStorageAvailable()) {
      try {
        const result = await window.storage.get(activeTabId);
        if (result && result.value) {
          const graphState = JSON.parse(result.value);
          graphState.nodes = updatedNodes;
          graphState.links = cleanedLinks;
          await window.storage.set(activeTabId, JSON.stringify(graphState));
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    } else if (activeTabId) {
      setSavedGraphs(prev => prev.map(g =>
        g.id === activeTabId
          ? { ...g, nodes: updatedNodes, links: cleanedLinks }
          : g
      ));
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      setError("Please select an answer first");
      return;
    }

    const currentQuiz = nodeContent[selectedNode.id]?.quiz;
    if (!currentQuiz || typeof currentQuiz.answer === 'undefined') {
      setError("Quiz data is incomplete");
      return;
    }

    const isCorrect = selectedAnswer === currentQuiz.answer;

    setScore(isCorrect ? 10 : 0);

    if (isCorrect) {
      unlockNodes(selectedNode, 10);
    }
  };

  const calculateNodeDistances = () => {
    const distances = {};

    graphData.nodes.forEach(node => {
      if (node.unlocked) {
        distances[node.id] = 0;
      } else {
        distances[node.id] = Infinity;
      }
    });

    let changed = true;
    while (changed) {
      changed = false;
      graphData.links.forEach(link => {
        const sourceId = link.source.id || link.source;
        const targetId = link.target.id || link.target;

        if (distances[sourceId] + 1 < distances[targetId]) {
          distances[targetId] = distances[sourceId] + 1;
          changed = true;
        }
        if (distances[targetId] + 1 < distances[sourceId]) {
          distances[sourceId] = distances[targetId] + 1;
          changed = true;
        }
      });
    }

    return distances;
  };

  const nodeDistances = useMemo(() => calculateNodeDistances(), [graphData]);

  const completedNodes = graphData.nodes.filter(n => n.quiz_completed).length;
  const totalNodes = graphData.nodes.length;
  const progressPercent = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  const getProgressColor = () => {
    if (progressPercent < 33) return "#ef4444";
    if (progressPercent < 66) return "#f59e0b";
    return "#10b981";
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0f172a" }}>
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        {loading && <LoadingProgress stage={loadingStage} progress={loadingProgress} />}

        <div className="w-1/2 flex items-center justify-center p-12 relative z-10">
          <div className="max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
                StudySphere
              </h1>
              <p className="text-slate-300 text-base" style={{ lineHeight: '1.5' }}>
                Interactive learning paths powered by AI
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && topic.trim() && !loading && handleStartLearning()}
                placeholder="Enter any topic..."
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-lg bg-white/10 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all backdrop-blur-sm disabled:opacity-50"
                style={{ fontSize: '15px' }}
              />
              <button
                onClick={handleStartLearning}
                disabled={!topic.trim() || loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white py-3.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ fontSize: '15px' }}
              >
                {loading ? "Generating..." : "Start Learning"}
              </button>
            </div>

            {savedGraphs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Recent Paths</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedGraphs.slice(0, 5).map(graph => (
                    <div
                      key={graph.id}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center justify-between transition-all cursor-pointer border border-white/10"
                      onClick={() => !loading && loadGraph(graph.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{graph.topic}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {graph.nodes.filter(n => n.quiz_completed).length}/{graph.nodes.length} completed
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loading && window.confirm(`Delete "${graph.topic}"?`)) {
                            deleteGraph(graph.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 ml-3 px-2 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 relative flex items-center justify-center">
          {/* Network visualization background */}
          <div style={{ width: "500px", height: "500px", position: "relative" }}>
            <svg width="500" height="500" style={{ opacity: 0.2 }}>
              <defs>
                <radialGradient id="nodeGlow">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Animated connections */}
              <line x1="250" y1="250" x2="150" y2="150" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <line x1="250" y1="250" x2="350" y2="150" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <line x1="250" y1="250" x2="150" y2="350" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <line x1="250" y1="250" x2="350" y2="350" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <line x1="150" y1="150" x2="100" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" />
              <line x1="350" y1="150" x2="400" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" />
              <line x1="150" y1="350" x2="100" y2="400" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" />
              <line x1="350" y1="350" x2="400" y2="400" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" />

              {/* Center node */}
              <circle cx="250" cy="250" r="25" fill="url(#nodeGlow)" />
              <circle cx="250" cy="250" r="18" fill="#3b82f6" />

              {/* Level 1 nodes */}
              <circle cx="150" cy="150" r="18" fill="#3b82f6" opacity="0.7" />
              <circle cx="350" cy="150" r="18" fill="#3b82f6" opacity="0.7" />
              <circle cx="150" cy="350" r="18" fill="#3b82f6" opacity="0.7" />
              <circle cx="350" cy="350" r="18" fill="#3b82f6" opacity="0.7" />

              {/* Level 2 nodes */}
              <circle cx="100" cy="100" r="14" fill="#64748b" opacity="0.5" />
              <circle cx="400" cy="100" r="14" fill="#64748b" opacity="0.5" />
              <circle cx="100" cy="400" r="14" fill="#64748b" opacity="0.5" />
              <circle cx="400" cy="400" r="14" fill="#64748b" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#0f172a" }}>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}

      <div style={{
        width: sidebarCollapsed ? "0" : "280px",
        background: "rgba(15, 23, 42, 0.95)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && topic.trim() && handleStartLearning()}
            placeholder="New topic..."
            style={{
              width: "89%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              outline: "none",
              marginBottom: "8px",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
          />
          <button
            onClick={handleStartLearning}
            disabled={!topic.trim() || loading}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "none",
              background: topic.trim() ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              cursor: topic.trim() ? "pointer" : "not-allowed",
              fontWeight: "500",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Generating..." : "Create Path"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          <h3 style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", padding: "0 8px 8px", letterSpacing: '0.05em' }}>
            Your Paths
          </h3>
          {savedGraphs.length === 0 ? (
            <p style={{ color: "#64748b", padding: "12px 8px", fontSize: "12px", textAlign: "center", lineHeight: '1.5' }}>
              No paths yet
            </p>
          ) : (
            savedGraphs.map(graph => (
              <div
                key={graph.id}
                onClick={() => loadGraph(graph.id)}
                style={{
                  padding: "10px",
                  margin: "0 0 6px 0",
                  borderRadius: "8px",
                  background: activeTabId === graph.id ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: activeTabId === graph.id ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                onMouseEnter={(e) => {
                  if (activeTabId !== graph.id) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTabId !== graph.id) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  }
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontWeight: "500", fontSize: "13px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {graph.topic}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "11px" }}>
                    {graph.nodes.filter(n => n.quiz_completed).length}/{graph.nodes.length} done
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${graph.topic}"?`)) {
                      deleteGraph(graph.id);
                    }
                  }}
                  style={{
                    color: "#64748b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    fontSize: "16px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          position: "fixed",
          left: sidebarCollapsed ? "12px" : "268px",
          top: "16px",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#94a3b8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          zIndex: 30,
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(10px)"
        }}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
        <ForceGraph2D
          width={window.innerWidth}
          height={window.innerHeight}
          graphData={graphData}
          nodeLabel="label"
          nodeAutoColorBy={n => (n.unlocked ? "unlocked" : "locked")}
          cooldownTicks={1}
          d3VelocityDecay={4.75}
          linkWidth={link => {
            const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
            const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
            const bothUnlocked = sourceNode?.unlocked && targetNode?.unlocked;
            const oneUnlocked = sourceNode?.unlocked || targetNode?.unlocked;
            return bothUnlocked ? 2 : oneUnlocked ? 1.5 : 1;
          }}
          linkColor={link => {
            const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
            const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
            const bothUnlocked = sourceNode?.unlocked && targetNode?.unlocked;
            const oneUnlocked = sourceNode?.unlocked || targetNode?.unlocked;

            if (bothUnlocked) return "rgba(59, 130, 246, 0.4)";
            if (oneUnlocked) return "rgba(100, 116, 139, 0.25)";
            return "rgba(71, 85, 105, 0.15)";
          }}
          linkDirectionalParticles={link => {
            const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
            const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
            return (sourceNode?.unlocked && targetNode?.unlocked) ? 2 : 0;
          }}
          linkDirectionalParticleWidth={2}
          nodeRelSize={10}
          nodeVal={node => {
            const nodeRadius = 50 - (node.level * 6);
            return nodeRadius;
          }}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 13 / globalScale;
            const nodeRadius = 18 - (node.level * 2.5);
            ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            let opacity = 1;
            if (!node.unlocked && !node.quiz_completed) {
              const distance = nodeDistances[node.id] || 0;
              opacity = Math.max(0.25, 1 - (distance * 0.2));
            }

            let fillColor, strokeColor;
            if (node.quiz_completed) {
              fillColor = "#10b981";
              strokeColor = "#059669";
            } else if (node.unlocked) {
              fillColor = "#3b82f6";
              strokeColor = "#2563eb";
            } else {
              fillColor = "#475569";
              strokeColor = "#334155";
            }

            ctx.globalAlpha = opacity;

            ctx.shadowBlur = node.unlocked ? 15 : 0;
            ctx.shadowColor = fillColor;

            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();

            if (node.unlocked) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
              ctx.beginPath();
              ctx.arc(node.x - nodeRadius * 0.2, node.y - nodeRadius * 0.2, nodeRadius * 0.3, 0, 2 * Math.PI);
              ctx.fill();
            }

            ctx.fillStyle = "#fff";
            ctx.shadowBlur = 3;
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.fillText(label, node.x + nodeRadius + 8, node.y);

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          }}
          onNodeClick={handleNodeClick}
        />

        {selectedNode && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 360,
              padding: 0,
              background: "rgba(15, 23, 42, 0.95)",
              color: "#fff",
              borderRadius: 12,
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>{selectedNode.label}</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "0 4px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#cbd5e1"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#cbd5e1", fontSize: "14px", whiteSpace: "pre-wrap" }}>
                {nodeContent[selectedNode.id]?.content || "Loading content..."}
              </p>

              {(() => {
                const quiz = nodeContent[selectedNode.id]?.quiz;
                console.log("Quiz data for node:", selectedNode.id, quiz);

                if (!quiz) {
                  return <p style={{ marginTop: "20px", color: "#64748b", fontSize: "13px" }}>No quiz available</p>;
                }

                if (!quiz.question || !quiz.options || !Array.isArray(quiz.options)) {
                  console.error("Invalid quiz structure:", quiz);
                  return <p style={{ marginTop: "20px", color: "#ef4444", fontSize: "13px" }}>Quiz data is malformed</p>;
                }

                return (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{
                      padding: "16px",
                      background: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "10px",
                      border: "1px solid rgba(59, 130, 246, 0.2)"
                    }}>
                      <p style={{ fontWeight: "600", marginBottom: "14px", fontSize: "14px", color: "#e2e8f0" }}>
                        {quiz.question}
                      </p>
                      {quiz.options.map((opt, idx) => (
                        <div key={idx} style={{ marginTop: "8px" }}>
                          <label style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: score === null ? "pointer" : "default",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            background: selectedAnswer === idx ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            transition: "all 0.2s",
                            border: "1px solid " + (selectedAnswer === idx ? "rgba(255, 255, 255, 0.2)" : "transparent"),
                            fontSize: "13px"
                          }}>
                            <input
                              type="radio"
                              name="quiz"
                              value={idx}
                              checked={selectedAnswer === idx}
                              onChange={() => setSelectedAnswer(idx)}
                              disabled={score !== null}
                              style={{ marginRight: "10px", accentColor: "#3b82f6" }}
                            />
                            <span style={{ flex: 1, color: "#cbd5e1" }}>{opt}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {score === null ? (
                <button
                  onClick={handleQuizSubmit}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "12px 20px",
                    background: "#3b82f6",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                >
                  Submit Answer
                </button>
              ) : score === 10 ? (
                <div style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "rgba(16, 185, 129, 0.15)",
                  borderRadius: "8px",
                  border: "1px solid rgba(16, 185, 129, 0.3)"
                }}>
                  <p style={{ color: "#10b981", fontWeight: "600", margin: 0, marginBottom: "6px", fontSize: "15px" }}>
                    ✓ Correct!
                  </p>
                  <p style={{ color: "#6ee7b7", margin: 0, fontSize: "13px" }}>
                    Continue to: {
                      graphData.links
                        .filter(l => (l.source.id || l.source) === selectedNode.id)
                        .map(l => {
                          const targetId = l.target.id || l.target;
                          const targetNode = graphData.nodes.find(n => n.id === targetId);
                          return targetNode?.label;
                        })
                        .filter(Boolean)
                        .join(", ") || "next topics"
                    }
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: "16px" }}>
                  <div style={{
                    padding: "16px",
                    background: "rgba(239, 68, 68, 0.15)",
                    borderRadius: "8px",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    marginBottom: "12px"
                  }}>
                    <p style={{ color: "#ef4444", fontWeight: "600", margin: 0, fontSize: "15px" }}>
                      ✗ Incorrect
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScore(null);
                      setSelectedAnswer(null);
                    }}
                    style={{
                      padding: "12px 20px",
                      width: "100%",
                      background: "#ef4444",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {graphData.nodes.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "rgba(15, 23, 42, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          zIndex: 25,
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ flex: 1, marginRight: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>
                Progress
              </span>
              <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "600" }}>
                {completedNodes} / {totalNodes} ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "3px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: getProgressColor(),
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "3px",
                boxShadow: `0 0 10px ${getProgressColor()}`
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}