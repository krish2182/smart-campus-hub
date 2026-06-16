import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Swal from "sweetalert2";

function ProfessorDashboard() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/projects/faculty-queue",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    let results = projects;

    if (statusFilter !== "all") {
      results = results.filter((p) => p.status === statusFilter);
    }

    if (searchTerm) {
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tech_stack.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.team_members?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredProjects(results);
  }, [searchTerm, statusFilter, projects]);

  const handleStatusUpdate = async (projectId, newStatus) => {
    const isApprove = newStatus === "approved";

    Swal.fire({
      title: isApprove ? "Approve Proposal?" : "Request Revisions?",
      text: isApprove
        ? "This moves the project status into the verified production cluster."
        : "This routes the submission back to the student workbench for code modifications.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#319795" : "#e53e3e",
      cancelButtonColor: "#718096",
      confirmButtonText: isApprove ? "Yes, Approve" : "Yes, Request Revision",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            `http://localhost:5000/api/projects/review/${projectId}`,
            { status: newStatus },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          Swal.fire({
            icon: "success",
            title: "Status Synchronized",
            text: `Project configuration updated to ${newStatus}.`,
            timer: 1500,
            showConfirmButton: false,
          });

          fetchQueue();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Action Failed",
            text: "State transmission error.",
          });
        }
      }
    });
  };

  const getChartData = () => {
    const counts = { pending: 0, approved: 0, changes_requested: 0 };
    projects.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return [
      { name: "Pending", count: counts.pending, color: "#dd6b20" },
      { name: "Approved", count: counts.approved, color: "#38a169" },
      { name: "Revisions", count: counts.changes_requested, color: "#e53e3e" },
    ];
  };

  if (loading)
    return (
      <div style={styles.loader}>Loading pristine dashboard environment...</div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.analyticsSection}>
        <div style={styles.statsTextCard}>
          <h2 style={{ margin: "0 0 10px 0", color: "#2d3748" }}>
            Dashboard Overview
          </h2>
          <p style={{ color: "#718096", margin: 0 }}>
            Track real-time metrics of ongoing final year capstone submissions
            across your assigned batches.
          </p>
          <div style={styles.badgeRow}>
            <div style={styles.statMiniCard}>
              📬 Total: <strong>{projects.length}</strong>
            </div>
            <div style={{ ...styles.statMiniCard, color: "#2b6cb0" }}>
              ⏳ Pending:{" "}
              <strong>
                {projects.filter((p) => p.status === "pending").length}
              </strong>
            </div>
          </div>
        </div>
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={getChartData()}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                style={{ fontSize: "12px" }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {getChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search by title, student name, or tech stack..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBar}
        />
        <div style={styles.tabGroup}>
          {["all", "pending", "approved", "changes_requested"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                ...styles.tabBtn,
                ...(statusFilter === tab ? styles.activeTabBtn : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={styles.emptyState}>
          No matching project submissions match your criteria.
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProjects.map((project) => (
            <div key={project.project_id} style={styles.card}>
              <div>
                <div style={styles.cardHeader}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <span style={{ ...styles.badge, ...styles[project.status] }}>
                    {project.status.toUpperCase().replace("_", " ")}
                  </span>
                </div>
                <p style={styles.desc}>{project.description}</p>
              </div>

              <div>
                <div style={styles.meta}>
                  <div style={{ marginBottom: "4px" }}>
                    🛠️ <strong>Stack:</strong> {project.tech_stack}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    👨‍💻 <strong>Team:</strong> {project.team_members}
                  </div>
                  <div>
                    📅 <strong>Batch Year:</strong> {project.academic_year}
                  </div>
                </div>

                {project.status === "pending" && (
                  <div style={styles.actionRow}>
                    <button
                      onClick={() =>
                        handleStatusUpdate(project.project_id, "approved")
                      }
                      style={styles.approveBtn}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          project.project_id,
                          "changes_requested",
                        )
                      }
                      style={styles.rejectBtn}
                    >
                      Request Revision
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "system-ui, sans-serif",
  },
  loader: {
    textAlign: "center",
    marginTop: "100px",
    fontSize: "18px",
    color: "#4a5568",
  },
  analyticsSection: {
    display: "flex",
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    gap: "30px",
    marginBottom: "30px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  statsTextCard: { flex: 2, minWidth: "280px" },
  badgeRow: { display: "flex", gap: "12px", marginTop: "15px" },
  statMiniCard: {
    padding: "8px 16px",
    background: "#f7fafc",
    borderRadius: "6px",
    fontSize: "14px",
    border: "1px solid #edf2f7",
  },
  chartWrapper: { flex: 1, minWidth: "250px" },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    minWidth: "300px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e0",
    fontSize: "15px",
    outline: "none",
  },
  tabGroup: {
    display: "flex",
    gap: "6px",
    background: "#edf2f7",
    padding: "4px",
    borderRadius: "8px",
  },
  tabBtn: {
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a5568",
    transition: "0.2s",
  },
  activeTabBtn: {
    background: "#fff",
    color: "#2d3748",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)",
    transition: "0.3s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "14px",
  },
  projectTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a202c",
    lineHeight: "1.4",
  },
  desc: {
    color: "#4a5568",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  },
  meta: {
    fontSize: "13px",
    color: "#4a5568",
    background: "#f7fafc",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #edf2f7",
  },
  actionRow: { display: "flex", gap: "12px" },
  approveBtn: {
    flex: 1,
    padding: "10px",
    background: "#319795",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  rejectBtn: {
    flex: 1,
    padding: "10px",
    background: "#fff",
    color: "#e53e3e",
    border: "1px solid #fed7d7",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: "#718096",
    fontSize: "15px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    shrink: "0",
  },
  pending: { background: "#feebc8", color: "#c05621" },
  approved: { background: "#c6f6d5", color: "#22543d" },
  changes_requested: { background: "#fed7d7", color: "#9b2c2c" },
};

export default ProfessorDashboard;
