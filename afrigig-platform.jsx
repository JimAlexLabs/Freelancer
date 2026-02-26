import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// DESIGN SYSTEM & THEME
// ============================================================
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --emerald: #00C896;
    --emerald-dark: #00A87D;
    --emerald-light: #E6FAF5;
    --midnight: #0A0F1C;
    --navy: #111827;
    --slate: #1F2937;
    --muted: #374151;
    --subtle: #6B7280;
    --border: #E5E7EB;
    --border-dark: #374151;
    --surface: #F9FAFB;
    --white: #FFFFFF;
    --amber: #F59E0B;
    --red: #EF4444;
    --blue: #3B82F6;
    --purple: #8B5CF6;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
    --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    --shadow-xl: 0 20px 50px -10px rgba(0,0,0,0.15);
    --radius: 12px;
    --radius-sm: 8px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }

  body { font-family: var(--font-body); background: var(--surface); color: var(--navy); line-height: 1.6; }
  h1,h2,h3,h4,h5,h6 { font-family: var(--font-display); line-height: 1.2; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }

  .animate-fade { animation: fadeIn 0.4s ease both; }
  .animate-slide { animation: slideIn 0.3s ease both; }
  .animate-spin { animation: spin 0.8s linear infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-down { animation: slideDown 0.3s ease both; }

  /* Status badge colors */
  .status-REGISTERED { background: #EEF2FF; color: #4338CA; }
  .status-PROFILE_COMPLETED { background: #FFF7ED; color: #C2410C; }
  .status-ASSESSMENT_PENDING { background: #FFFBEB; color: #B45309; }
  .status-ASSESSMENT_SUBMITTED { background: #EFF6FF; color: #1D4ED8; }
  .status-UNDER_REVIEW { background: #FDF4FF; color: #7E22CE; }
  .status-APPROVED { background: #ECFDF5; color: #065F46; }
  .status-REJECTED { background: #FEF2F2; color: #991B1B; }
  .status-SUSPENDED { background: #FFF7ED; color: #9A3412; }
  .status-active { background: #ECFDF5; color: #065F46; }
  .status-pending { background: #FFFBEB; color: #B45309; }
  .status-open { background: #EFF6FF; color: #1D4ED8; }
  .status-in_progress { background: #FDF4FF; color: #7E22CE; }
  .status-completed { background: #ECFDF5; color: #065F46; }
  .status-escrow { background: #FFF7ED; color: #C2410C; }

  /* Skeleton loading */
  .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 400px 100%; animation: shimmer 1.2s infinite; border-radius: 6px; }

  /* Toast */
  .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .toast { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; pointer-events: all; display: flex; align-items: center; gap: 10px; min-width: 280px; max-width: 380px; box-shadow: var(--shadow-lg); animation: slideIn 0.3s ease; font-family: var(--font-body); }
  .toast-success { background: #065F46; color: white; }
  .toast-error { background: #991B1B; color: white; }
  .toast-info { background: #1D4ED8; color: white; }
  .toast-warning { background: #B45309; color: white; }

  /* Ping dot */
  .ping-dot { position: relative; display: inline-flex; }
  .ping-dot::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--emerald); animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }

  /* Overlay */
  .overlay { position: fixed; inset: 0; background: rgba(10,15,28,0.65); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
  
  /* Modal */
  .modal { background: white; border-radius: var(--radius-lg); padding: 32px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; animation: fadeIn 0.25s ease; box-shadow: var(--shadow-xl); }

  /* Table */
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--subtle); border-bottom: 1px solid var(--border); font-family: var(--font-display); }
  td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface); }

  /* Progress bar */
  .progress-bar { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--emerald), var(--emerald-dark)); border-radius: 99px; transition: width 0.5s ease; }

  /* Notification dot */
  .notif-dot { width: 8px; height: 8px; background: var(--red); border-radius: 50%; border: 2px solid white; }

  /* Card hover */
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

  /* Input focus */
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--emerald) !important; box-shadow: 0 0 0 3px rgba(0,200,150,0.12); }

  /* Button press */
  button:active:not(:disabled) { transform: scale(0.97); }

  /* Stagger children */
  .stagger > * { animation: fadeIn 0.4s ease both; }
  .stagger > *:nth-child(1) { animation-delay: 0ms; }
  .stagger > *:nth-child(2) { animation-delay: 60ms; }
  .stagger > *:nth-child(3) { animation-delay: 120ms; }
  .stagger > *:nth-child(4) { animation-delay: 180ms; }
  .stagger > *:nth-child(5) { animation-delay: 240ms; }
  .stagger > *:nth-child(6) { animation-delay: 300ms; }

  /* Sidebar */
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; color: var(--subtle); text-decoration: none; }
  .sidebar-item:hover { background: var(--surface); color: var(--navy); }
  .sidebar-item.active { background: var(--emerald-light); color: var(--emerald-dark); font-weight: 600; }
  .sidebar-item .icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* Chart bar */
  .chart-bar { background: linear-gradient(180deg, var(--emerald) 0%, var(--emerald-dark) 100%); border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

  /* Scrollable */
  .scrollable { overflow-y: auto; scrollbar-width: thin; }

  /* Tag */
  .tag { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; background: var(--emerald-light); color: var(--emerald-dark); }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* Avatar */
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--emerald), var(--blue)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; font-family: var(--font-display); flex-shrink: 0; }

  /* Assessment timer */
  @keyframes timerPulse { 0%,100% { color: var(--red); } 50% { color: #ff6b6b; } }
  .timer-warning { animation: timerPulse 1s ease-in-out infinite; }

  /* Online indicator */
  .online-dot { width: 10px; height: 10px; background: var(--emerald); border-radius: 50%; border: 2px solid white; }
`;
document.head.appendChild(style);

// ============================================================
// MOCK DATA & STATE
// ============================================================
const MOCK_FREELANCERS = [
  { id: 2, name: "Amara Osei", email: "amara@gmail.com", country: "Ghana", skills: "React, TypeScript, Node.js", freelancer_status: "UNDER_REVIEW", status: "pending", assessment_score: 87, assessment_percentage: 87, assessment_submitted_at: "2026-02-10T09:00:00Z", review_queue_position: 1, bio: "5 years of full-stack development experience.", portfolio_links: "https://amaraosei.dev", experience: "Senior Developer at TechCo Ghana", availability: "Full-time", avatar: null, is_online: true },
  { id: 3, name: "Fatima Diallo", email: "fatima@outlook.com", country: "Senegal", skills: "Python, Django, PostgreSQL", freelancer_status: "UNDER_REVIEW", status: "pending", assessment_score: 92, assessment_percentage: 92, assessment_submitted_at: "2026-02-12T11:30:00Z", review_queue_position: 2, bio: "Backend specialist with data engineering background.", portfolio_links: "https://github.com/fatima-dev", experience: "Lead Backend Engineer at Dakar Fintech", availability: "Full-time", avatar: null, is_online: false },
  { id: 4, name: "Kwame Mensah", email: "kwame@gmail.com", country: "Kenya", skills: "Flutter, Dart, Firebase", freelancer_status: "APPROVED", status: "active", assessment_score: 78, assessment_percentage: 78, assessment_submitted_at: "2026-02-01T08:00:00Z", review_queue_position: null, bio: "Mobile developer specializing in cross-platform apps.", portfolio_links: "https://kwamemensh.com", experience: "2 years mobile dev", availability: "Part-time", avatar: null, is_online: true },
  { id: 5, name: "Ngozi Adeyemi", email: "ngozi@yahoo.com", country: "Nigeria", skills: "UI/UX, Figma, React", freelancer_status: "ASSESSMENT_PENDING", status: "pending", assessment_score: null, assessment_percentage: null, assessment_submitted_at: null, review_queue_position: null, bio: "Product designer with dev skills.", portfolio_links: "https://ngozid.co", experience: "3 years design", availability: "Full-time", avatar: null, is_online: false },
  { id: 6, name: "Tariq Hassan", email: "tariq@gmail.com", country: "Tanzania", skills: "Vue.js, Laravel, MySQL", freelancer_status: "REJECTED", status: "banned", assessment_score: 45, assessment_percentage: 45, assessment_submitted_at: "2026-01-25T14:00:00Z", review_queue_position: null, bio: "Junior developer.", portfolio_links: "", experience: "1 year", availability: "Full-time", avatar: null, is_online: false },
];

const MOCK_JOBS = [
  { id: 1, title: "Build React E-Commerce Dashboard", category: "Web Development", budget_min: 50000, budget_max: 80000, duration_days: 14, status: "open", payment_status: "unpaid", created_at: "2026-02-18T10:00:00Z", applications_count: 5, description: "Create a comprehensive e-commerce admin dashboard with analytics, order management, and inventory tracking using React and TypeScript.", assigned_freelancer: null, progress: 0, skills: ["React", "TypeScript", "Tailwind"] },
  { id: 2, title: "M-Pesa Payment Integration API", category: "Backend", budget_min: 30000, budget_max: 45000, duration_days: 7, status: "in_progress", payment_status: "escrow", created_at: "2026-02-10T08:00:00Z", applications_count: 8, description: "Integrate M-Pesa STK Push payment gateway with existing Laravel application. Handle webhooks, callbacks, and transaction reconciliation.", assigned_freelancer: { id: 4, name: "Kwame Mensah" }, progress: 65, skills: ["Laravel", "PHP", "M-Pesa"] },
  { id: 3, title: "Flutter Mobile App for Logistics", category: "Mobile", budget_min: 70000, budget_max: 100000, duration_days: 30, status: "open", payment_status: "unpaid", created_at: "2026-02-20T09:00:00Z", applications_count: 3, description: "Build a cross-platform logistics tracking app with real-time GPS, route optimization, and delivery management.", assigned_freelancer: null, progress: 0, skills: ["Flutter", "Firebase", "Google Maps"] },
  { id: 4, title: "Data Pipeline & Analytics Setup", category: "Data Engineering", budget_min: 40000, budget_max: 60000, duration_days: 10, status: "completed", payment_status: "released", created_at: "2026-01-15T07:00:00Z", applications_count: 6, description: "Set up ETL pipeline and analytics dashboard for fintech startup.", assigned_freelancer: { id: 3, name: "Fatima Diallo" }, progress: 100, skills: ["Python", "PostgreSQL", "dbt"] },
];

const MOCK_TRANSACTIONS = [
  { id: 1, type: "escrow_hold", entry_type: "credit", amount: 45000, currency: "KES", status: "completed", created_at: "2026-02-10T08:30:00Z", reference: "ESC-001", meta: { job_title: "M-Pesa Payment Integration API" } },
  { id: 2, type: "escrow_release", entry_type: "credit", amount: 38250, currency: "KES", status: "completed", created_at: "2026-02-19T14:00:00Z", reference: "REL-001", meta: { job_title: "Data Pipeline & Analytics" } },
  { id: 3, type: "commission", entry_type: "debit", amount: 3825, currency: "KES", status: "completed", created_at: "2026-02-19T14:01:00Z", reference: "COM-001", meta: {} },
  { id: 4, type: "deposit", entry_type: "credit", amount: 80000, currency: "KES", status: "completed", created_at: "2026-02-18T11:00:00Z", reference: "DEP-001", meta: {} },
];

const MOCK_TICKETS = [
  { id: 1, subject: "Unable to submit assessment", message: "I get an error when I try to submit my assessment. The page crashes after answering Q12.", status: "open", priority: "high", user: { name: "Ngozi Adeyemi" }, created_at: "2026-02-21T10:00:00Z" },
  { id: 2, subject: "Payment not reflecting", message: "I paid the assessment fee via M-Pesa but my status hasn't changed.", status: "in_progress", priority: "high", user: { name: "Tariq Hassan" }, created_at: "2026-02-20T14:00:00Z" },
  { id: 3, subject: "Profile update not saving", message: "When I update my portfolio link, it doesn't save properly.", status: "resolved", priority: "low", user: { name: "Amara Osei" }, created_at: "2026-02-19T09:00:00Z" },
];

const MOCK_MESSAGES = [
  { id: 1, sender: { name: "Amara Osei", id: 2 }, body: "Hi! I just submitted my proposal for the React dashboard project. Looking forward to hearing back!", created_at: "2026-02-21T11:30:00Z", read: false, job_title: "Build React E-Commerce Dashboard" },
  { id: 2, sender: { name: "Kwame Mensah", id: 4 }, body: "The M-Pesa integration is 65% done. I've completed the STK Push and callback handling. Working on reconciliation now.", created_at: "2026-02-21T09:15:00Z", read: true, job_title: "M-Pesa Payment Integration API" },
  { id: 3, sender: { name: "Fatima Diallo", id: 3 }, body: "The data pipeline is live. All tests are passing and the analytics dashboard is ready for review.", created_at: "2026-02-20T16:45:00Z", read: true, job_title: "Data Pipeline & Analytics Setup" },
];

const ASSESSMENT_QUESTIONS = [
  { id: 1, category: "Technical Skills", question: "What is the primary purpose of version control systems like Git?", options: ["Track and manage changes to code over time", "Compile source code into executables", "Design user interfaces", "Manage relational databases"], correct: 0, points: 10 },
  { id: 2, category: "Technical Skills", question: "Which HTTP method is semantically used to retrieve data without side effects?", options: ["GET", "POST", "PUT", "DELETE"], correct: 0, points: 10 },
  { id: 3, category: "Technical Skills", question: "What does API stand for in software development?", options: ["Application Programming Interface", "Automated Process Integration", "Advanced Protocol Implementation", "Application Process Index"], correct: 0, points: 10 },
  { id: 4, category: "Technical Skills", question: "Which of the following is a NoSQL database?", options: ["MongoDB", "MySQL", "PostgreSQL", "Oracle"], correct: 0, points: 10 },
  { id: 5, category: "Technical Skills", question: "What is the primary purpose of CSS in web development?", options: ["Style and present HTML elements visually", "Add dynamic interactivity to pages", "Structure semantic document content", "Handle server-side business logic"], correct: 0, points: 10 },
  { id: 6, category: "Communication", question: "A client provides vague requirements for a project. What is the best approach?", options: ["Ask clarifying questions before starting work", "Make reasonable assumptions and proceed", "Wait indefinitely for better requirements", "Suggest a completely different project"], correct: 0, points: 10 },
  { id: 7, category: "Communication", question: "You've discovered a bug that will delay delivery by 3 days. What do you do?", options: ["Inform the client immediately with a revised timeline", "Work overtime and hope to deliver on time without telling them", "Blame the original specifications and ask for more time", "Deliver incomplete work on the original date"], correct: 0, points: 10 },
  { id: 8, category: "Communication", question: "How often should you proactively update clients on project progress?", options: ["Regularly, with planned status updates at key milestones", "Only when something goes wrong", "Only at project completion", "Only when the client specifically asks"], correct: 0, points: 10 },
  { id: 9, category: "Problem Solving", question: "When faced with a technical problem you've never encountered, what's your first step?", options: ["Research documentation, Stack Overflow, and similar issues thoroughly", "Ask for help immediately without attempting to solve it", "Give up and inform the client you can't complete the task", "Implement a quick hack without understanding the root cause"], correct: 0, points: 10 },
  { id: 10, category: "Problem Solving", question: "A client requests a feature that you believe is technically infeasible within the budget. What do you do?", options: ["Discuss alternatives that achieve the same goal within constraints", "Agree to build it knowing it will fail", "Refuse the project entirely without explanation", "Build something different without telling the client"], correct: 0, points: 10 },
  { id: 11, category: "Problem Solving", question: "Your code passes all tests locally but fails in production. What's your approach?", options: ["Systematically compare environments and reproduce the issue", "Deploy repeatedly hoping it fixes itself", "Blame the server infrastructure immediately", "Revert all changes without investigation"], correct: 0, points: 10 },
  { id: 12, category: "Problem Solving", question: "Which approach best describes how to handle technical debt in a project?", options: ["Document it, prioritize by impact, and address it strategically", "Ignore it until the system breaks down completely", "Rewrite the entire codebase from scratch immediately", "Never write any code that could become technical debt"], correct: 0, points: 10 },
  { id: 13, category: "Time Management", question: "You're working on three projects simultaneously and all have urgent deadlines. What do you do?", options: ["Prioritize by impact and deadline, communicate clearly with all clients", "Work on all three equally and miss all deadlines", "Focus on the easiest one first regardless of priority", "Stop work on all projects until you can handle one at a time"], correct: 0, points: 10 },
  { id: 14, category: "Time Management", question: "How should you estimate task duration to clients?", options: ["Add buffer time for unknowns and communicate your estimation method", "Always give the absolute minimum time to win the project", "Multiply your gut feeling by 3 without any reasoning", "Refuse to give estimates because software timelines are unpredictable"], correct: 0, points: 10 },
  { id: 15, category: "Time Management", question: "A client requests significant scope changes mid-project. How do you handle this?", options: ["Evaluate impact, update timeline/budget, and get formal approval", "Implement all changes immediately without adjusting expectations", "Refuse to make any changes to the original scope", "Complete the original scope first, then secretly add the changes"], correct: 0, points: 10 },
  { id: 16, category: "Professional Ethics", question: "A client asks you to copy code from a competitor's proprietary system. What do you do?", options: ["Decline and explain the legal and ethical issues clearly", "Do it since the client is responsible for legal consequences", "Do it but keep it secret from other stakeholders", "Ask for extra compensation to take on the legal risk"], correct: 0, points: 10 },
  { id: 17, category: "Professional Ethics", question: "You realize a mistake in your work that the client hasn't noticed yet. What do you do?", options: ["Proactively disclose it and provide a plan to fix it", "Hope the client never notices and do nothing", "Fix it quietly without telling anyone", "Blame external factors if the client ever discovers it"], correct: 0, points: 10 },
];

// ============================================================
// UTILITY HOOKS & HELPERS
// ============================================================
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

function useTimer(initialSeconds, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, running, onExpire]);
  const start = () => setRunning(true);
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return { seconds, running, start, formatted: fmt(seconds) };
}

const fmtCurrency = (amount, currency = "KES") =>
  `${currency} ${Number(amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtRelative = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
};

const getInitials = (name) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const STATUS_LABELS = {
  REGISTERED: "Registered", PROFILE_COMPLETED: "Profile Complete",
  ASSESSMENT_PENDING: "Assessment Pending", ASSESSMENT_SUBMITTED: "Assessment Submitted",
  UNDER_REVIEW: "Under Review", APPROVED: "Approved", REJECTED: "Rejected", SUSPENDED: "Suspended",
  active: "Active", pending: "Pending", open: "Open", in_progress: "In Progress",
  completed: "Completed", cancelled: "Cancelled", escrow: "In Escrow", released: "Released",
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
const Btn = ({ children, variant = "primary", size = "md", onClick, disabled, loading, icon, style: s = {} }) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, fontFamily: "var(--font-display)", fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer", border: "none", transition: "all 0.15s ease", opacity: disabled || loading ? 0.6 : 1, whiteSpace: "nowrap" };
  const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "10px 18px", fontSize: 14 }, lg: { padding: "14px 24px", fontSize: 15 } };
  const variants = {
    primary: { background: "var(--emerald)", color: "white", boxShadow: "0 2px 8px rgba(0,200,150,0.3)" },
    secondary: { background: "var(--surface)", color: "var(--navy)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--subtle)" },
    danger: { background: "var(--red)", color: "white", boxShadow: "0 2px 8px rgba(239,68,68,0.3)" },
    outline: { background: "transparent", color: "var(--emerald)", border: "1.5px solid var(--emerald)" },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...s }} onClick={onClick} disabled={disabled || loading}>
      {loading ? <span className="animate-spin" style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} /> : icon}
      {children}
    </button>
  );
};

const Card = ({ children, style: s = {}, className = "", onClick }) => (
  <div className={className} onClick={onClick} style={{ background: "white", borderRadius: "var(--radius)", padding: 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", ...s }}>{children}</div>
);

const Badge = ({ status, label }) => (
  <span className={`status-${status}`} style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>
    {label || STATUS_LABELS[status] || status}
  </span>
);

const Input = ({ label, value, onChange, type = "text", placeholder, required, rows, style: s = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-display)" }}>{label}{required && <span style={{ color: "var(--red)" }}> *</span>}</label>}
    {rows ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-body)", resize: "vertical", transition: "all 0.15s ease", ...s }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-body)", transition: "all 0.15s ease", ...s }} />
    )}
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-display)" }}>{label}{required && <span style={{ color: "var(--red)" }}> *</span>}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-body)", background: "white", cursor: "pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const StatCard = ({ label, value, icon, color = "var(--emerald)", delta, sub }) => (
  <Card style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 13, color: "var(--subtle)", fontWeight: 500, marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--navy)" }}>{value}</p>
        {delta && <p style={{ fontSize: 12, color: "var(--emerald)", marginTop: 4 }}>↑ {delta}</p>}
        {sub && <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
    </div>
    <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, background: `${color}06`, borderRadius: "50%", transform: "translate(20px, 20px)" }} />
  </Card>
);

const Avatar = ({ name, size = 36, online }) => (
  <div style={{ position: "relative", display: "inline-flex" }}>
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{getInitials(name)}</div>
    {online !== undefined && <div className={online ? "online-dot" : ""} style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: online ? "var(--emerald)" : "var(--border)", borderRadius: "50%", border: "2px solid white" }} />}
  </div>
);

const Empty = ({ icon, title, sub }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--subtle)" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--muted)", marginBottom: 6 }}>{title}</h3>
    <p style={{ fontSize: 14 }}>{sub}</p>
  </div>
);

// ============================================================
// TOAST DISPLAY
// ============================================================
function ToastDisplay({ toasts }) {
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ width: 18, height: 18, background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// NAVIGATION / SIDEBAR
// ============================================================
const NAV_ITEMS = {
  admin: [
    { label: "Dashboard", icon: "⬛", key: "dashboard" },
    { label: "Freelancer Reviews", icon: "👥", key: "reviews", badge: 2 },
    { label: "Jobs", icon: "💼", key: "jobs" },
    { label: "Payments", icon: "💳", key: "payments" },
    { label: "Users", icon: "🧑", key: "users" },
    { label: "Messages", icon: "💬", key: "messages" },
    { label: "Support Tickets", icon: "🎫", key: "support" },
    { label: "Reports", icon: "📊", key: "reports" },
    { label: "Settings", icon: "⚙", key: "settings" },
  ],
  support: [
    { label: "Dashboard", icon: "⬛", key: "dashboard" },
    { label: "Tickets", icon: "🎫", key: "support", badge: 2 },
    { label: "Messages", icon: "💬", key: "messages" },
    { label: "Users", icon: "🧑", key: "users" },
    { label: "Projects", icon: "📁", key: "projects" },
    { label: "FR Reviews", icon: "👥", key: "reviews" },
    { label: "Content", icon: "📄", key: "content" },
  ],
  freelancer: [
    { label: "Dashboard", icon: "⬛", key: "dashboard" },
    { label: "Find Jobs", icon: "🔍", key: "jobs" },
    { label: "My Applications", icon: "📤", key: "applications" },
    { label: "Active Projects", icon: "📁", key: "projects" },
    { label: "Messages", icon: "💬", key: "messages" },
    { label: "Earnings", icon: "💰", key: "earnings" },
    { label: "Profile", icon: "🪪", key: "profile" },
  ],
};

function Sidebar({ role, activeKey, onNavigate, user, onLogout }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.freelancer;
  return (
    <div style={{ width: 240, background: "white", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--emerald), #00A07E)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>A</span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--midnight)", lineHeight: 1 }}>AfriGig</div>
            <div style={{ fontSize: 11, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{role}</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map(item => (
            <div key={item.key} className={`sidebar-item ${activeKey === item.key ? "active" : ""}`} onClick={() => onNavigate(item.key)}>
              <span className="icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: "var(--red)", color: "white", borderRadius: 99, fontSize: 11, padding: "1px 6px", fontWeight: 700 }}>{item.badge}</span>}
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user?.name} online={true} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--subtle)", padding: 4 }} title="Logout">⏏</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onAuth }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const faqs = [
    { q: "How long does approval take?", a: "Our review process takes 10-15 business days. You'll receive real-time updates on your status." },
    { q: "What is the assessment fee?", a: "The assessment unlocking fee is KES 1,000 - 2,000. This covers the cost of the review process." },
    { q: "Can I work from any African country?", a: "Yes! We support freelancers from all 54 African countries. Payments are processed in local currencies." },
    { q: "How are payments handled?", a: "All payments go through a secure escrow system. Funds are only released upon client approval." },
  ];
  return (
    <div style={{ fontFamily: "var(--font-body)", overflowX: "hidden" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)", padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, var(--emerald), #00A07E)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)" }}>A</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--midnight)" }}>AfriGig</span>
        </div>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["How it Works", "For Freelancers", "For Clients", "About"].map(l => (
            <a key={l} href="#" style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", fontWeight: 500 }}>{l}</a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" onClick={() => onAuth("login")}>Sign In</Btn>
          <Btn onClick={() => onAuth("register")}>Join AfriGig</Btn>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--midnight) 0%, #162032 60%, #0f2419 100%)", padding: "100px 48px 120px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,200,150,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 400, height: 400, background: "radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="animate-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.3)", borderRadius: 99, padding: "6px 16px", marginBottom: 32 }}>
            <div className="ping-dot" style={{ width: 8, height: 8, background: "var(--emerald)", borderRadius: "50%", flexShrink: 0 }} />
            <span style={{ color: "var(--emerald)", fontSize: 13, fontWeight: 600 }}>Now live in 12 African countries</span>
          </div>
          <h1 className="animate-fade" style={{ fontSize: 64, fontWeight: 800, color: "white", lineHeight: 1.1, maxWidth: 700, animationDelay: "0.1s" }}>
            Africa's Premier{" "}
            <span style={{ color: "var(--emerald)", display: "block" }}>Freelancing Platform</span>
          </h1>
          <p className="animate-fade" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 540, marginTop: 20, lineHeight: 1.7, animationDelay: "0.2s" }}>
            Connect African talent with global opportunities. Verified professionals, secure payments via M-Pesa & Stripe, real-time collaboration.
          </p>
          <div className="animate-fade" style={{ display: "flex", gap: 14, marginTop: 36, animationDelay: "0.3s" }}>
            <Btn size="lg" onClick={() => onAuth("register")} style={{ fontSize: 16 }}>Start Your Journey →</Btn>
            <Btn variant="ghost" size="lg" style={{ color: "rgba(255,255,255,0.7)" }}>Watch Demo ▶</Btn>
          </div>
          <div className="animate-fade stagger" style={{ display: "flex", gap: 32, marginTop: 56, animationDelay: "0.4s" }}>
            {[["2,400+", "Verified Freelancers"], ["840+", "Projects Completed"], ["KES 120M+", "Paid Out"], ["98%", "Client Satisfaction"]].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "white", fontFamily: "var(--font-display)" }}>{val}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "var(--midnight)" }}>How AfriGig Works</h2>
          <p style={{ fontSize: 16, color: "var(--subtle)", marginTop: 12 }}>A rigorous process ensures only the best talent connects with clients.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="stagger">
          {[
            { step: "01", icon: "📝", title: "Create Account", desc: "Register as a freelancer and build your professional profile." },
            { step: "02", icon: "🎯", title: "Take Assessment", desc: "Unlock and complete our 17-question skills assessment with a 2-hour timer." },
            { step: "03", icon: "🔍", title: "Expert Review", desc: "Our team reviews your profile and assessment within 15 business days." },
            { step: "04", icon: "🚀", title: "Start Earning", desc: "Browse jobs, submit proposals, and get paid securely via escrow." },
          ].map(s => (
            <div key={s.step} style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, fontSize: 64, fontWeight: 800, color: "var(--border)", fontFamily: "var(--font-display)", lineHeight: 1, zIndex: 0 }}>{s.step}</div>
              <Card style={{ position: "relative", zIndex: 1, marginTop: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "var(--subtle)", lineHeight: 1.6 }}>{s.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "60px 48px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "var(--midnight)", textAlign: "center", marginBottom: 40 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              style={{ background: "white", borderRadius: var_radius, border: "1px solid var(--border)", marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--navy)" }}>{f.q}</span>
                <span style={{ fontSize: 18, color: "var(--subtle)", transform: activeFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }}>+</span>
              </div>
              {activeFaq === i && <div className="animate-down" style={{ padding: "0 20px 18px", fontSize: 14, color: "var(--subtle)", lineHeight: 1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, var(--midnight), #162032)", padding: "80px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, color: "white", marginBottom: 16 }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Join thousands of African professionals building global careers.</p>
        <Btn size="lg" onClick={() => onAuth("register")} style={{ fontSize: 16 }}>Create Free Account →</Btn>
      </section>

      <footer style={{ background: "var(--midnight)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>© 2026 AfriGig. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textDecoration: "none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

// Make `var_radius` actually work as inline:
const var_radius = "var(--radius)";

// ============================================================
// AUTH PAGES
// ============================================================
function AuthPage({ mode: initialMode, onLogin }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const { toasts, show } = useToast();

  const handleSubmit = async () => {
    if (mode === "register") {
      if (!form.name || !form.email || !form.password) return show("Please fill all required fields", "error");
      if (form.password !== form.confirm) return show("Passwords do not match", "error");
    }
    if (!form.email || !form.password) return show("Email and password required", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);

    // Demo: admin login
    if (form.email === "admin@afrigig.com") {
      onLogin({ id: 1, name: "Admin User", email: form.email, role: "admin", status: "active" }, "admin");
      return;
    }
    if (form.email === "support@afrigig.com") {
      onLogin({ id: 99, name: "Support Agent", email: form.email, role: "support", status: "active" }, "support");
      return;
    }
    // New freelancer registration
    if (mode === "register") {
      onLogin({ id: Date.now(), name: form.name, email: form.email, role: "freelancer", status: "pending", freelancer_status: "REGISTERED" }, "freelancer");
      return;
    }
    // Existing freelancer (demo approved)
    onLogin({ id: 4, name: "Kwame Mensah", email: form.email, role: "freelancer", status: "active", freelancer_status: "APPROVED", skills: "Flutter, Dart, Firebase", country: "Kenya", availability: "Part-time" }, "freelancer");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, var(--midnight) 0%, #162032 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <ToastDisplay toasts={toasts} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 70%, rgba(0,200,150,0.08) 0%, transparent 50%)" }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, var(--emerald), #00A07E)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: "white", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>A</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "white" }}>
            {mode === "login" ? "Welcome back" : "Join AfriGig"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>
            {mode === "login" ? "Sign in to your account" : "Create your freelancer account"}
          </p>
        </div>

        <Card style={{ padding: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Amara Osei" required />}
            <Input label="Email Address" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@email.com" required />
            <Input label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="••••••••" required />
            {mode === "register" && <Input label="Confirm Password" type="password" value={form.confirm} onChange={v => setForm({ ...form, confirm: v })} placeholder="••••••••" required />}

            <Btn loading={loading} onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Btn>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--subtle)" }}>
            {mode === "login" ? (
              <span>New to AfriGig? <button onClick={() => setMode("register")} style={{ background: "none", border: "none", color: "var(--emerald)", cursor: "pointer", fontWeight: 600 }}>Register</button></span>
            ) : (
              <span>Already have an account? <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "var(--emerald)", cursor: "pointer", fontWeight: 600 }}>Sign In</button></span>
            )}
          </div>

          {mode === "login" && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--surface)", borderRadius: 8, fontSize: 13, color: "var(--subtle)" }}>
              <strong>Demo credentials:</strong><br />
              Admin: <code style={{ background: "white", padding: "1px 5px", borderRadius: 4 }}>admin@afrigig.com</code> / any password<br />
              Support: <code style={{ background: "white", padding: "1px 5px", borderRadius: 4 }}>support@afrigig.com</code> / any password<br />
              Freelancer: any other email / any password
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING FLOW
// ============================================================
function OnboardingFlow({ user, onUpdate, onComplete }) {
  const { toasts, show } = useToast();
  const step = user.freelancer_status;

  if (step === "APPROVED") { onComplete(); return null; }

  const steps = ["REGISTERED", "PROFILE_COMPLETED", "ASSESSMENT_PENDING", "ASSESSMENT_SUBMITTED", "UNDER_REVIEW", "APPROVED"];
  const stepIdx = steps.indexOf(step);
  const progress = Math.max(0, (stepIdx / (steps.length - 1)) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex" }}>
      <ToastDisplay toasts={toasts} />
      {/* Left Panel */}
      <div style={{ width: 300, background: "linear-gradient(180deg, var(--midnight) 0%, #162032 100%)", padding: "40px 32px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "white", marginBottom: 4 }}>AfriGig</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Freelancer Onboarding</div>
        </div>
        <div style={{ flex: 1 }}>
          {[
            { key: "REGISTERED", label: "Create Account", icon: "✓" },
            { key: "PROFILE_COMPLETED", label: "Complete Profile", icon: "2" },
            { key: "ASSESSMENT_PENDING", label: "Assessment Fee", icon: "3" },
            { key: "ASSESSMENT_SUBMITTED", label: "Take Assessment", icon: "4" },
            { key: "UNDER_REVIEW", label: "Under Review", icon: "5" },
            { key: "APPROVED", label: "Start Working", icon: "6" },
          ].map((s, i) => {
            const done = stepIdx > i;
            const active = step === s.key;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, opacity: done || active ? 1 : 0.4 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "var(--emerald)" : active ? "rgba(0,200,150,0.2)" : "rgba(255,255,255,0.1)", border: active ? "2px solid var(--emerald)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: done ? "white" : active ? "var(--emerald)" : "rgba(255,255,255,0.5)" }}>{done ? "✓" : i + 1}</span>
                </div>
                <span style={{ fontSize: 14, color: active ? "white" : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", fontWeight: active ? 600 : 400 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Overall Progress</div>
          <div className="progress-bar" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{Math.round(progress)}% Complete</div>
        </div>
      </div>

      {/* Right Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        {step === "REGISTERED" && <ProfileStep user={user} onSave={(data) => { onUpdate({ ...user, ...data, freelancer_status: "PROFILE_COMPLETED" }); show("Profile saved successfully!", "success"); }} show={show} />}
        {step === "PROFILE_COMPLETED" && <AssessmentGateStep user={user} onUnlock={() => { onUpdate({ ...user, freelancer_status: "ASSESSMENT_PENDING", assessment_unlocked: true }); show("Assessment unlocked!", "success"); }} show={show} />}
        {step === "ASSESSMENT_PENDING" && <AssessmentStep user={user} onSubmit={(results) => { onUpdate({ ...user, ...results, freelancer_status: "UNDER_REVIEW" }); show("Assessment submitted! Your profile is now under review.", "success"); }} show={show} />}
        {(step === "ASSESSMENT_SUBMITTED" || step === "UNDER_REVIEW") && <ReviewStatusStep user={user} />}
        {step === "REJECTED" && <RejectedStep user={user} />}
        {step === "SUSPENDED" && <SuspendedStep />}
      </div>
    </div>
  );
}

function ProfileStep({ user, onSave, show }) {
  const [form, setForm] = useState({ skills: user.skills || "", experience: user.experience || "", availability: user.availability || "Full-time", country: user.country || "", timezone: user.timezone || "Africa/Nairobi", bio: user.bio || "", portfolio_links: user.portfolio_links || "" });
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!form.skills || !form.experience || !form.country) return show("Please fill all required fields", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    onSave(form);
  };
  return (
    <div style={{ width: "100%", maxWidth: 600 }} className="animate-fade">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--midnight)", marginBottom: 8 }}>Complete Your Profile</h2>
      <p style={{ color: "var(--subtle)", marginBottom: 32 }}>Tell us about your skills and experience. This helps clients find you.</p>
      <Card style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Skills" value={form.skills} onChange={v => setForm({ ...form, skills: v })} placeholder="React, Node.js, TypeScript, Python..." required />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Experience" value={form.experience} onChange={v => setForm({ ...form, experience: v })} placeholder="5 years of full-stack development at..." required rows={3} />
          </div>
          <Input label="Country" value={form.country} onChange={v => setForm({ ...form, country: v })} placeholder="Kenya" required />
          <Select label="Availability" value={form.availability} onChange={v => setForm({ ...form, availability: v })} options={[{ value: "Full-time", label: "Full-time" }, { value: "Part-time", label: "Part-time" }, { value: "Weekends", label: "Weekends Only" }]} />
          <Input label="Timezone" value={form.timezone} onChange={v => setForm({ ...form, timezone: v })} placeholder="Africa/Nairobi" />
          <Input label="Portfolio Link" value={form.portfolio_links} onChange={v => setForm({ ...form, portfolio_links: v })} placeholder="https://yourportfolio.com" />
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Bio" value={form.bio} onChange={v => setForm({ ...form, bio: v })} placeholder="Tell clients about yourself..." rows={3} />
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <Btn loading={loading} onClick={handleSave}>Save & Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

function AssessmentGateStep({ user, onUnlock, show }) {
  const [amount, setAmount] = useState("1500");
  const [phone, setPhone] = useState("254712345678");
  const [loading, setLoading] = useState(false);
  const handlePay = async () => {
    if (!phone || !amount) return show("Enter phone and amount", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    show("Payment of KES " + Number(amount).toLocaleString() + " received via M-Pesa!", "success");
    setTimeout(onUnlock, 1000);
  };
  return (
    <div style={{ width: "100%", maxWidth: 480 }} className="animate-fade">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--midnight)", marginBottom: 8 }}>Unlock Assessment</h2>
      <p style={{ color: "var(--subtle)", marginBottom: 32 }}>Pay a one-time fee to unlock the skills assessment. This covers the cost of expert review.</p>
      <Card style={{ padding: 32 }}>
        <div style={{ background: "var(--emerald-light)", border: "1px solid rgba(0,200,150,0.2)", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "var(--emerald-dark)", fontWeight: 600 }}>Assessment Fee</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--emerald-dark)" }}>KES 1,000 – 2,000</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--emerald-dark)", opacity: 0.7, marginTop: 6 }}>One-time payment. Includes expert review of your profile.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="M-Pesa Phone Number" value={phone} onChange={setPhone} placeholder="254712345678" />
          <Input label="Amount (KES)" type="number" value={amount} onChange={setAmount} placeholder="1500" />
          <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: "#FFF7ED", borderRadius: 8, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>📱</span>
            <span style={{ fontSize: 13, color: "#C2410C" }}>You will receive an M-Pesa STK Push prompt to confirm payment.</span>
          </div>
          <Btn loading={loading} onClick={handlePay} style={{ width: "100%", justifyContent: "center" }}>Pay & Unlock Assessment →</Btn>
        </div>
      </Card>
    </div>
  );
}

function AssessmentStep({ user, onSubmit, show }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const startTime = useRef(Date.now());
  const { seconds, running, start, formatted } = useTimer(7200, () => handleSubmit(true));

  useEffect(() => { start(); }, []);

  const handleAnswer = (qId, answerIdx) => setAnswers(a => ({ ...a, [qId]: answerIdx }));

  const handleSubmit = async (autoSubmit = false) => {
    if (Object.keys(answers).length < ASSESSMENT_QUESTIONS.length && !autoSubmit) {
      return show(`Please answer all questions. ${ASSESSMENT_QUESTIONS.length - Object.keys(answers).length} remaining.`, "error");
    }
    let score = 0;
    ASSESSMENT_QUESTIONS.forEach(q => { if (answers[q.id] === q.correct) score += q.points; });
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 1000));
    onSubmit({ assessment_score: score, assessment_max_score: 100, assessment_percentage: score, assessment_time_spent: timeSpent, assessment_submitted_at: new Date().toISOString(), assessment_answers: answers });
  };

  if (submitted) return (
    <div style={{ textAlign: "center" }} className="animate-fade">
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Assessment Submitted!</h2>
      <p style={{ color: "var(--subtle)", marginTop: 8 }}>Your profile is now under review. Redirecting...</p>
    </div>
  );

  const q = ASSESSMENT_QUESTIONS[current];
  const categories = [...new Set(ASSESSMENT_QUESTIONS.map(q => q.category))];
  const answered = Object.keys(answers).length;
  const isWarning = seconds < 600;

  return (
    <div style={{ width: "100%", maxWidth: 680 }} className="animate-fade">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--midnight)" }}>Skills Assessment</h2>
          <p style={{ color: "var(--subtle)", fontSize: 14 }}>Question {current + 1} of {ASSESSMENT_QUESTIONS.length}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={isWarning ? "timer-warning" : ""} style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: isWarning ? "var(--red)" : "var(--navy)" }}>⏱ {formatted}</div>
          <div style={{ fontSize: 12, color: "var(--subtle)" }}>Time remaining</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
          {ASSESSMENT_QUESTIONS.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ flex: 1, height: 4, borderRadius: 99, background: answers[i + 1] !== undefined ? "var(--emerald)" : i === current ? "var(--emerald)" : "var(--border)", opacity: i === current ? 1 : answers[i + 1] !== undefined ? 0.7 : 0.5, cursor: "pointer", transition: "all 0.2s ease" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--subtle)" }}>{answered} of {ASSESSMENT_QUESTIONS.length} answered</div>
      </div>

      <Card style={{ padding: 32 }}>
        <div style={{ marginBottom: 8 }}>
          <span className="tag" style={{ fontSize: 11 }}>{q.category} · {q.points} pts</span>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--midnight)", marginBottom: 24, lineHeight: 1.4 }}>{q.question}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <div key={i} onClick={() => handleAnswer(q.id, i)}
                style={{ padding: "14px 18px", borderRadius: 10, border: `2px solid ${selected ? "var(--emerald)" : "var(--border)"}`, background: selected ? "var(--emerald-light)" : "white", cursor: "pointer", transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selected ? "var(--emerald)" : "var(--border)"}`, background: selected ? "var(--emerald)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selected && <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} />}
                </div>
                <span style={{ fontSize: 14, color: selected ? "var(--emerald-dark)" : "var(--navy)", fontWeight: selected ? 600 : 400 }}>{opt}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {current > 0 && <Btn variant="secondary" onClick={() => setCurrent(c => c - 1)} icon="←">Previous</Btn>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {current < ASSESSMENT_QUESTIONS.length - 1 ? (
              <Btn onClick={() => setCurrent(c => c + 1)}>Next →</Btn>
            ) : (
              <Btn onClick={() => handleSubmit()} icon="✓" style={{ background: "var(--emerald-dark)" }}>Submit Assessment</Btn>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReviewStatusStep({ user }) {
  const deadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  return (
    <div style={{ textAlign: "center", maxWidth: 520 }} className="animate-fade">
      <div style={{ width: 80, height: 80, background: "var(--emerald-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>🔍</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--midnight)", marginBottom: 12 }}>Under Review</h2>
      <p style={{ color: "var(--subtle)", lineHeight: 1.7, marginBottom: 32 }}>Our team is reviewing your profile and assessment. This usually takes 10–15 business days. You'll receive an email and real-time notification once a decision is made.</p>
      <Card style={{ padding: 28, textAlign: "left" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--subtle)", fontSize: 14 }}>Status</span>
            <Badge status="UNDER_REVIEW" />
          </div>
          {user.assessment_percentage && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--subtle)", fontSize: 14 }}>Assessment Score</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: user.assessment_percentage >= 60 ? "var(--emerald-dark)" : "var(--red)" }}>{user.assessment_percentage}%</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--subtle)", fontSize: 14 }}>Review Deadline</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{deadline.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--subtle)", fontSize: 14 }}>Queue Position</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>#{user.review_queue_position || "–"}</span>
          </div>
        </div>
      </Card>
      <p style={{ marginTop: 20, fontSize: 13, color: "var(--subtle)" }}>⚡ Status updates in real-time. You'll be notified immediately when reviewed.</p>
    </div>
  );
}

function RejectedStep({ user }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Application Not Approved</h2>
      <p style={{ color: "var(--subtle)", marginTop: 8, lineHeight: 1.7, marginBottom: 24 }}>We reviewed your application and unfortunately couldn't approve it at this time.</p>
      {user.rejection_reason && (
        <Card style={{ padding: 20, textAlign: "left", background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <p style={{ fontSize: 14, color: "#991B1B" }}><strong>Reason:</strong> {user.rejection_reason}</p>
        </Card>
      )}
    </div>
  );
}

function SuspendedStep() {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>⏸</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Account Suspended</h2>
      <p style={{ color: "var(--subtle)", marginTop: 8 }}>Your account has been temporarily suspended. Please contact support for assistance.</p>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ user, activeView, onNavigate, show }) {
  const views = {
    dashboard: <AdminOverview onNavigate={onNavigate} show={show} />,
    reviews: <FreelancerReviews show={show} />,
    jobs: <JobManagement show={show} />,
    payments: <PaymentManagement show={show} />,
    users: <UserManagement show={show} />,
    messages: <MessagesView role="admin" show={show} />,
    support: <SupportTickets show={show} />,
    reports: <ReportsView />,
    settings: <SettingsView user={user} show={show} />,
  };
  return views[activeView] || views.dashboard;
}

function AdminOverview({ onNavigate, show }) {
  const pending = MOCK_FREELANCERS.filter(f => f.freelancer_status === "UNDER_REVIEW").length;
  const active = MOCK_FREELANCERS.filter(f => f.freelancer_status === "APPROVED").length;
  const openJobs = MOCK_JOBS.filter(j => j.status === "open").length;

  const activityData = [
    { month: "Sep", val: 32 }, { month: "Oct", val: 45 }, { month: "Nov", val: 38 },
    { month: "Dec", val: 52 }, { month: "Jan", val: 61 }, { month: "Feb", val: 47 },
  ];
  const maxVal = Math.max(...activityData.map(d => d.val));

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Admin Dashboard</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Welcome back. Here's what's happening on AfriGig.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }} className="stagger">
        <StatCard label="Pending Reviews" value={pending} icon="👥" color="var(--purple)" delta="+2 this week" />
        <StatCard label="Active Freelancers" value={active} icon="✅" color="var(--emerald)" delta="+5 this month" />
        <StatCard label="Open Jobs" value={openJobs} icon="💼" color="var(--blue)" />
        <StatCard label="Escrow Balance" value="KES 125K" icon="💰" color="var(--amber)" sub="Across 4 jobs" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Chart */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Freelancer Applications (6 months)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
            {activityData.map(d => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--subtle)", fontWeight: 600 }}>{d.val}</span>
                <div className="chart-bar" style={{ width: "100%", height: `${(d.val / maxVal) * 100}%` }} />
                <span style={{ fontSize: 11, color: "var(--subtle)" }}>{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Queue */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Review Queue</h3>
            <Btn size="sm" variant="outline" onClick={() => onNavigate("reviews")}>View All</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_FREELANCERS.filter(f => f.freelancer_status === "UNDER_REVIEW").map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", borderRadius: 8 }}>
                <Avatar name={f.name} online={f.is_online} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "var(--subtle)" }}>{f.assessment_percentage}% · {f.country}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)" }}>#{f.review_queue_position}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Recent Jobs</h3>
          <Btn size="sm" variant="outline" onClick={() => onNavigate("jobs")}>Manage Jobs</Btn>
        </div>
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Applications</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_JOBS.map(job => (
              <tr key={job.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: "var(--subtle)" }}>{job.category}</div>
                </td>
                <td><Badge status={job.status} /></td>
                <td style={{ fontSize: 14, fontWeight: 600 }}>{fmtCurrency(job.budget_max)}</td>
                <td><span style={{ background: "var(--surface)", padding: "3px 8px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>{job.applications_count}</span></td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{fmtDate(job.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// FREELANCER REVIEWS
// ============================================================
function FreelancerReviews({ show }) {
  const [selected, setSelected] = useState(null);
  const [freelancers, setFreelancers] = useState(MOCK_FREELANCERS);
  const [filter, setFilter] = useState("UNDER_REVIEW");
  const [actionLoading, setActionLoading] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = freelancers.filter(f => filter === "all" ? true : f.freelancer_status === filter);
  const selectedF = selected ? freelancers.find(f => f.id === selected) : null;

  const handleAction = async (action) => {
    if (action === "reject") { setRejectModal(true); return; }
    setActionLoading(action);
    await new Promise(r => setTimeout(r, 1000));
    const updates = {
      approve: { freelancer_status: "APPROVED", status: "active" },
      suspend: { freelancer_status: "SUSPENDED", status: "suspended" },
    };
    setFreelancers(prev => prev.map(f => f.id === selected ? { ...f, ...updates[action] } : f));
    show(`Freelancer ${action === "approve" ? "approved" : "suspended"} successfully`, "success");
    setActionLoading("");
    setSelected(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return show("Please provide a rejection reason", "error");
    setActionLoading("reject");
    await new Promise(r => setTimeout(r, 800));
    setFreelancers(prev => prev.map(f => f.id === selected ? { ...f, freelancer_status: "REJECTED", status: "banned", rejection_reason: rejectReason } : f));
    show("Freelancer rejected", "info");
    setRejectModal(false);
    setRejectReason("");
    setActionLoading("");
    setSelected(null);
  };

  return (
    <div className="animate-fade">
      {rejectModal && (
        <div className="overlay" onClick={() => setRejectModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Reject Application</h3>
            <Input label="Rejection Reason" value={rejectReason} onChange={setRejectReason} placeholder="Explain why this freelancer is being rejected..." rows={4} required />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn variant="danger" loading={actionLoading === "reject"} onClick={handleReject}>Confirm Rejection</Btn>
              <Btn variant="secondary" onClick={() => setRejectModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Freelancer Reviews</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Review and approve freelancer applications.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["UNDER_REVIEW", "Under Review"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"], ["all", "All"]].map(([val, lbl]) => (
          <Btn key={val} variant={filter === val ? "primary" : "secondary"} size="sm" onClick={() => setFilter(val)}>{lbl}</Btn>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, alignItems: "flex-start" }}>
        {/* List */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {filtered.length === 0 ? <Empty icon="📭" title="No freelancers" sub="None match this filter" /> :
            filtered.map(f => (
              <div key={f.id} onClick={() => setSelected(f.id)}
                style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected === f.id ? "var(--emerald-light)" : "white", transition: "background 0.15s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={f.name} online={f.is_online} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--navy)" }}>{f.name}</span>
                      {f.assessment_percentage && <span style={{ fontSize: 12, fontWeight: 700, color: f.assessment_percentage >= 60 ? "var(--emerald-dark)" : "var(--red)" }}>{f.assessment_percentage}%</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>{f.country} · {f.skills?.split(",")[0]}</div>
                    <div style={{ marginTop: 6 }}><Badge status={f.freelancer_status} /></div>
                  </div>
                </div>
              </div>
            ))}
        </Card>

        {/* Detail */}
        {selectedF ? (
          <Card key={selectedF.id} className="animate-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={selectedF.name} size={52} online={selectedF.is_online} />
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>{selectedF.name}</h2>
                  <p style={{ color: "var(--subtle)", fontSize: 14 }}>{selectedF.email} · {selectedF.country}</p>
                  <div style={{ marginTop: 6 }}><Badge status={selectedF.freelancer_status} /></div>
                </div>
              </div>
              {selectedF.assessment_percentage && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: selectedF.assessment_percentage >= 60 ? "var(--emerald-dark)" : "var(--red)" }}>{selectedF.assessment_percentage}%</div>
                  <div style={{ fontSize: 12, color: "var(--subtle)" }}>Assessment Score</div>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Skills", value: selectedF.skills },
                { label: "Availability", value: selectedF.availability },
                { label: "Experience", value: selectedF.experience },
                { label: "Portfolio", value: selectedF.portfolio_links || "Not provided" },
                { label: "Queue Position", value: selectedF.review_queue_position ? `#${selectedF.review_queue_position}` : "—" },
                { label: "Submitted", value: selectedF.assessment_submitted_at ? fmtDate(selectedF.assessment_submitted_at) : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--navy)", wordBreak: "break-all" }}>{value}</div>
                </div>
              ))}
            </div>

            {selectedF.bio && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Bio</div>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>{selectedF.bio}</p>
              </div>
            )}

            {selectedF.freelancer_status === "UNDER_REVIEW" && (
              <div style={{ display: "flex", gap: 10, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <Btn loading={actionLoading === "approve"} onClick={() => handleAction("approve")} icon="✓">Approve</Btn>
                <Btn variant="danger" loading={actionLoading === "reject"} onClick={() => handleAction("reject")} icon="✕">Reject</Btn>
                <Btn variant="secondary" loading={actionLoading === "suspend"} onClick={() => handleAction("suspend")} icon="⏸">Suspend</Btn>
              </div>
            )}

            {selectedF.freelancer_status === "REJECTED" && selectedF.rejection_reason && (
              <div style={{ padding: "12px 16px", background: "#FEF2F2", borderRadius: 8, marginTop: 16 }}>
                <strong style={{ fontSize: 13, color: "#991B1B" }}>Rejection reason:</strong>
                <p style={{ fontSize: 14, color: "#991B1B", marginTop: 4 }}>{selectedF.rejection_reason}</p>
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <Empty icon="👆" title="Select a freelancer" sub="Click on a name to view their full profile and assessment results" />
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// JOB MANAGEMENT
// ============================================================
function JobManagement({ show }) {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Web Development", budget_min: "", budget_max: "", duration_days: "", skills: "" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.budget_max) return show("Fill all required fields", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const newJob = { id: Date.now(), title: form.title, description: form.description, category: form.category, budget_min: Number(form.budget_min), budget_max: Number(form.budget_max), duration_days: Number(form.duration_days), status: "open", payment_status: "unpaid", created_at: new Date().toISOString(), applications_count: 0, assigned_freelancer: null, progress: 0, skills: form.skills.split(",").map(s => s.trim()) };
    setJobs(prev => [newJob, ...prev]);
    show("Job created successfully!", "success");
    setLoading(false);
    setShowModal(false);
    setForm({ title: "", description: "", category: "Web Development", budget_min: "", budget_max: "", duration_days: "", skills: "" });
  };

  return (
    <div className="animate-fade">
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Post New Job</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Job Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Build React E-Commerce Dashboard" required />
              <Input label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Detailed job description..." rows={4} required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Min Budget (KES)" type="number" value={form.budget_min} onChange={v => setForm({ ...form, budget_min: v })} placeholder="15000" />
                <Input label="Max Budget (KES)" type="number" value={form.budget_max} onChange={v => setForm({ ...form, budget_max: v })} placeholder="30000" required />
                <Select label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} options={["Web Development", "Mobile", "Backend", "Data Engineering", "UI/UX", "DevOps"].map(v => ({ value: v, label: v }))} />
                <Input label="Duration (days)" type="number" value={form.duration_days} onChange={v => setForm({ ...form, duration_days: v })} placeholder="14" />
              </div>
              <Input label="Required Skills (comma-separated)" value={form.skills} onChange={v => setForm({ ...form, skills: v })} placeholder="React, TypeScript, Tailwind" />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Btn loading={loading} onClick={handleCreate}>Post Job</Btn>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Job Management</h1>
          <p style={{ color: "var(--subtle)", marginTop: 4 }}>Create and manage client jobs.</p>
        </div>
        <Btn onClick={() => setShowModal(true)} icon="+" >Post New Job</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="stagger">
        {jobs.map(job => (
          <Card key={job.id} style={{ cursor: "pointer" }} className="card-hover" onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>{job.title}</h3>
                  <Badge status={job.status} />
                  <Badge status={job.payment_status} />
                </div>
                <p style={{ fontSize: 14, color: "var(--subtle)", marginBottom: 12 }}>{job.description?.slice(0, 100)}...</p>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--subtle)" }}>
                  <span>💰 {fmtCurrency(job.budget_min)} – {fmtCurrency(job.budget_max)}</span>
                  <span>⏱ {job.duration_days} days</span>
                  <span>📤 {job.applications_count} applications</span>
                  <span>📅 {fmtDate(job.created_at)}</span>
                </div>
                {job.skills && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {(Array.isArray(job.skills) ? job.skills : job.skills.split(",")).map(s => <span key={s} className="tag">{s.trim()}</span>)}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", marginLeft: 20 }}>
                {job.progress > 0 && (
                  <div style={{ width: 80 }}>
                    <div style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 4 }}>{job.progress}% done</div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${job.progress}%` }} /></div>
                  </div>
                )}
              </div>
            </div>
            {selectedJob === job.id && job.assigned_freelancer && (
              <div className="animate-down" style={{ marginTop: 16, padding: "12px 16px", background: "var(--emerald-light)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--emerald-dark)", fontWeight: 600 }}>Assigned to: {job.assigned_freelancer.name}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAYMENT MANAGEMENT
// ============================================================
function PaymentManagement({ show }) {
  const [escrows, setEscrows] = useState([
    { id: 1, job_id: 2, job_title: "M-Pesa Payment Integration API", amount: 45000, status: "holding", freelancer: "Kwame Mensah", created_at: "2026-02-10T08:30:00Z" },
    { id: 2, job_id: 3, job_title: "Flutter Mobile App for Logistics", amount: 85000, status: "holding", freelancer: null, created_at: "2026-02-21T10:00:00Z" },
  ]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositForm, setDepositForm] = useState({ job_id: "1", amount: "", method: "mpesa", phone: "254712345678" });
  const [loading, setLoading] = useState("");

  const handleRelease = async (id) => {
    setLoading(`release-${id}`);
    await new Promise(r => setTimeout(r, 1000));
    setEscrows(prev => prev.map(e => e.id === id ? { ...e, status: "released" } : e));
    show("Escrow released to freelancer's wallet!", "success");
    setLoading("");
  };

  return (
    <div className="animate-fade">
      {showDepositModal && (
        <div className="overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Deposit to Escrow</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Select label="Job" value={depositForm.job_id} onChange={v => setDepositForm({ ...depositForm, job_id: v })}
                options={MOCK_JOBS.map(j => ({ value: String(j.id), label: j.title }))} />
              <Input label="Amount (KES)" type="number" value={depositForm.amount} onChange={v => setDepositForm({ ...depositForm, amount: v })} placeholder="45000" required />
              <Select label="Payment Method" value={depositForm.method} onChange={v => setDepositForm({ ...depositForm, method: v })}
                options={[{ value: "mpesa", label: "M-Pesa" }, { value: "stripe", label: "Stripe" }, { value: "bank", label: "Bank Transfer" }]} />
              {depositForm.method === "mpesa" && <Input label="Phone Number" value={depositForm.phone} onChange={v => setDepositForm({ ...depositForm, phone: v })} placeholder="254712345678" />}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Btn loading={loading === "deposit"} onClick={async () => {
                setLoading("deposit");
                await new Promise(r => setTimeout(r, 1200));
                show(`KES ${Number(depositForm.amount).toLocaleString()} deposited to escrow!`, "success");
                setLoading("");
                setShowDepositModal(false);
              }}>Process Deposit</Btn>
              <Btn variant="secondary" onClick={() => setShowDepositModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Payment & Escrow</h1>
          <p style={{ color: "var(--subtle)", marginTop: 4 }}>Manage payments and escrow releases.</p>
        </div>
        <Btn onClick={() => setShowDepositModal(true)} icon="💳">Deposit to Escrow</Btn>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="stagger">
        <StatCard label="Total in Escrow" value="KES 130K" icon="🔒" color="var(--amber)" />
        <StatCard label="Released This Month" value="KES 38.3K" icon="💸" color="var(--emerald)" />
        <StatCard label="Pending Transactions" value="2" icon="⏳" color="var(--blue)" />
      </div>

      {/* Escrow Table */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Active Escrows</h3>
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Freelancer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {escrows.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.job_title}</td>
                <td style={{ color: e.freelancer ? "var(--navy)" : "var(--subtle)" }}>{e.freelancer || "Unassigned"}</td>
                <td style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{fmtCurrency(e.amount)}</td>
                <td><Badge status={e.status === "holding" ? "ASSESSMENT_PENDING" : e.status === "released" ? "APPROVED" : e.status} label={e.status === "holding" ? "Holding" : e.status === "released" ? "Released" : e.status} /></td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{fmtDate(e.created_at)}</td>
                <td>
                  {e.status === "holding" && e.freelancer && (
                    <Btn size="sm" loading={loading === `release-${e.id}`} onClick={() => handleRelease(e.id)}>Release</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Transaction History */}
      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{t.entry_type === "credit" ? "📥" : "📤"}</span>
                    <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{t.type.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: t.entry_type === "credit" ? "var(--emerald-dark)" : "var(--red)" }}>
                  {t.entry_type === "credit" ? "+" : "-"}{fmtCurrency(t.amount, t.currency)}
                </td>
                <td><Badge status="APPROVED" label={t.status} /></td>
                <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--subtle)" }}>{t.reference}</td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{fmtDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// USER MANAGEMENT
// ============================================================
function UserManagement({ show }) {
  const [users, setUsers] = useState(MOCK_FREELANCERS);
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSuspend = async (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u));
    show("User status updated", "success");
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>User Management</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>View and manage all platform users.</p>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search by name or email..." />
      </Card>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Country</th>
              <th>FR Status</th>
              <th>Account Status</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={u.name} online={u.is_online} size={32} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "var(--subtle)" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>{u.country}</td>
                <td><Badge status={u.freelancer_status} /></td>
                <td><Badge status={u.status} /></td>
                <td style={{ fontWeight: 700, color: u.assessment_percentage >= 60 ? "var(--emerald-dark)" : u.assessment_percentage ? "var(--red)" : "var(--subtle)" }}>{u.assessment_percentage ? `${u.assessment_percentage}%` : "—"}</td>
                <td>
                  <Btn size="sm" variant={u.status === "suspended" ? "primary" : "secondary"} onClick={() => handleSuspend(u.id)}>
                    {u.status === "suspended" ? "Unsuspend" : "Suspend"}
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// MESSAGES
// ============================================================
function MessagesView({ role, show }) {
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [thread, setThread] = useState([
    { id: 1, sender: "Amara Osei", body: "Hi! I just submitted my proposal for the React dashboard project.", time: "11:30 AM", mine: false },
    { id: 2, sender: "You", body: "Thanks Amara! We'll review it shortly. Your profile looks impressive.", time: "11:45 AM", mine: true },
    { id: 3, sender: "Amara Osei", body: "Appreciate it! Happy to do a quick call if needed.", time: "12:00 PM", mine: false },
  ]);

  const handleSend = () => {
    if (!reply.trim()) return;
    setThread(prev => [...prev, { id: Date.now(), sender: "You", body: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), mine: true }]);
    setReply("");
    show("Message sent!", "success");
  };

  const selectedMsg = selected ? messages.find(m => m.id === selected) : null;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Messages</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 0, background: "white", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", height: 600 }}>
        {/* Inbox */}
        <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Inbox</h3>
          </div>
          {messages.map(m => (
            <div key={m.id} onClick={() => setSelected(m.id)}
              style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected === m.id ? "var(--emerald-light)" : "white", transition: "background 0.15s ease" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar name={m.sender.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.sender.name}</span>
                    <span style={{ fontSize: 11, color: "var(--subtle)" }}>{fmtRelative(m.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.body}</p>
                  {!m.read && <div style={{ width: 8, height: 8, background: "var(--emerald)", borderRadius: "50%", marginTop: 4 }} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Thread */}
        {selectedMsg ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={selectedMsg.sender.name} size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedMsg.sender.name}</div>
                <div style={{ fontSize: 12, color: "var(--subtle)" }}>Re: {selectedMsg.job_title}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {thread.map(msg => (
                <div key={msg.id} style={{ display: "flex", justifyContent: msg.mine ? "flex-end" : "flex-start", marginBottom: 14 }}>
                  <div style={{ maxWidth: "70%", padding: "10px 14px", background: msg.mine ? "var(--emerald)" : "var(--surface)", borderRadius: msg.mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px", color: msg.mine ? "white" : "var(--navy)" }}>
                    <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.body}</p>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
              <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-body)" }} />
              <Btn onClick={handleSend} icon="→">Send</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Empty icon="💬" title="Select a conversation" sub="Choose a message to view the full thread" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUPPORT TICKETS
// ============================================================
function SupportTickets({ show }) {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");

  const handleRespond = async () => {
    if (!response.trim()) return;
    setTickets(prev => prev.map(t => t.id === selected ? { ...t, status: "in_progress" } : t));
    show("Response sent!", "success");
    setResponse("");
  };

  const handleClose = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    show("Ticket resolved", "success");
    setSelected(null);
  };

  const priorityColors = { high: "var(--red)", medium: "var(--amber)", low: "var(--emerald)" };
  const selectedTicket = selected ? tickets.find(t => t.id === selected) : null;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Support Tickets</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Manage and resolve user support requests.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 20 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {tickets.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected === t.id ? "var(--emerald-light)" : "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>#{t.id} · {t.subject}</span>
                <div style={{ width: 8, height: 8, background: priorityColors[t.priority], borderRadius: "50%", marginTop: 4 }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 6 }}>{t.user.name} · {fmtRelative(t.created_at)}</div>
              <Badge status={t.status} label={t.status.replace("_", " ")} />
            </div>
          ))}
        </Card>

        {selectedTicket ? (
          <Card className="animate-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selectedTicket.subject}</h3>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge status={selectedTicket.status} label={selectedTicket.status.replace("_", " ")} />
                  <span style={{ fontSize: 12, color: priorityColors[selectedTicket.priority], fontWeight: 600, textTransform: "uppercase" }}>{selectedTicket.priority} priority</span>
                </div>
              </div>
              {selectedTicket.status !== "resolved" && (
                <Btn variant="secondary" size="sm" onClick={() => handleClose(selectedTicket.id)}>Mark Resolved</Btn>
              )}
            </div>
            <div style={{ padding: "16px", background: "var(--surface)", borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 6 }}>From: {selectedTicket.user.name}</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>{selectedTicket.message}</p>
            </div>
            {selectedTicket.status !== "resolved" && (
              <div>
                <Input label="Response" value={response} onChange={setResponse} placeholder="Write your response..." rows={4} />
                <div style={{ marginTop: 12 }}>
                  <Btn onClick={handleRespond}>Send Response</Btn>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Empty icon="🎫" title="Select a ticket" sub="Click a ticket to view and respond" />
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// REPORTS
// ============================================================
function ReportsView() {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const revenue = [12000, 18000, 15000, 22000, 28000, 35000, 41000];
  const signups = [8, 12, 9, 15, 18, 22, 17];
  const maxRevenue = Math.max(...revenue);

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Reports & Analytics</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Platform performance and growth metrics.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }} className="stagger">
        <StatCard label="Total Revenue (KES)" value="171K" icon="📈" color="var(--emerald)" delta="+18% MoM" />
        <StatCard label="New Freelancers" value="101" icon="👤" color="var(--blue)" delta="+22% MoM" />
        <StatCard label="Jobs Completed" value="47" icon="✅" color="var(--purple)" />
        <StatCard label="Avg. Approval Rate" value="68%" icon="📊" color="var(--amber)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Revenue Trend (KES '000)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180 }}>
            {revenue.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--subtle)", fontWeight: 600 }}>{(v / 1000).toFixed(0)}K</span>
                <div className="chart-bar" style={{ width: "100%", height: `${(v / maxRevenue) * 100}%` }} />
                <span style={{ fontSize: 11, color: "var(--subtle)" }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Freelancer Status Breakdown</h3>
          {[["APPROVED", "Approved", 1, "var(--emerald)"], ["UNDER_REVIEW", "Under Review", 2, "var(--purple)"], ["REJECTED", "Rejected", 1, "var(--red)"], ["ASSESSMENT_PENDING", "Pending", 1, "var(--amber)"]].map(([status, label, count, color]) => (
            <div key={status} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(count / 5) * 100}%`, background: color }} /></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS
// ============================================================
function SettingsView({ user, show }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, assessmentFee: "1500", reviewDays: "15", commissionRate: "15", minScore: "60" });
  return (
    <div className="animate-fade" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Settings</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Configure platform settings.</p>
      </div>
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>My Profile</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => show("Profile updated!", "success")}>Save Profile</Btn>
        </div>
      </Card>
      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Platform Configuration</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Assessment Fee (KES)" type="number" value={form.assessmentFee} onChange={v => setForm({ ...form, assessmentFee: v })} />
          <Input label="Review Period (business days)" type="number" value={form.reviewDays} onChange={v => setForm({ ...form, reviewDays: v })} />
          <Input label="Commission Rate (%)" type="number" value={form.commissionRate} onChange={v => setForm({ ...form, commissionRate: v })} />
          <Input label="Min Assessment Score (%)" type="number" value={form.minScore} onChange={v => setForm({ ...form, minScore: v })} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => show("Platform settings updated!", "success")}>Save Settings</Btn>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// FREELANCER DASHBOARD
// ============================================================
function FreelancerDashboard({ user, activeView, onNavigate, show }) {
  const views = {
    dashboard: <FreelancerOverview user={user} onNavigate={onNavigate} />,
    jobs: <FreelancerJobs user={user} show={show} />,
    applications: <FreelancerApplications user={user} show={show} />,
    projects: <FreelancerProjects user={user} />,
    messages: <MessagesView role="freelancer" show={show} />,
    earnings: <FreelancerEarnings user={user} />,
    profile: <FreelancerProfile user={user} show={show} />,
  };
  return views[activeView] || views.dashboard;
}

function FreelancerOverview({ user, onNavigate }) {
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Welcome back, {user.name.split(" ")[0]}! 👋</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Here's your freelancer dashboard.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }} className="stagger">
        <StatCard label="Active Projects" value="1" icon="📁" color="var(--blue)" />
        <StatCard label="Proposals Sent" value="3" icon="📤" color="var(--purple)" />
        <StatCard label="Wallet Balance" value="KES 38.3K" icon="💰" color="var(--emerald)" delta="Available" />
        <StatCard label="Completion Rate" value="100%" icon="⭐" color="var(--amber)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Open Jobs</h3>
            <Btn size="sm" variant="outline" onClick={() => onNavigate("jobs")}>Browse All</Btn>
          </div>
          {MOCK_JOBS.filter(j => j.status === "open").map(job => (
            <div key={job.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{job.title}</h4>
                  <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--subtle)" }}>
                    <span>💰 {fmtCurrency(job.budget_max)}</span>
                    <span>⏱ {job.duration_days} days</span>
                    <span>📤 {job.applications_count} bids</span>
                  </div>
                </div>
                <Btn size="sm" onClick={() => onNavigate("jobs")}>Apply</Btn>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["🔍 Browse Jobs", "jobs"], ["📤 My Applications", "applications"], ["💬 Messages", "messages"], ["💰 Earnings", "earnings"]].map(([label, key]) => (
              <div key={key} onClick={() => onNavigate(key)}
                style={{ padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--emerald)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                {label} <span style={{ color: "var(--subtle)" }}>→</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FreelancerJobs({ user, show }) {
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({ cover_letter: "", bid_amount: "", estimated_days: "", commitment: false, experience: false, delivery: false });
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState([]);

  const handleApply = async () => {
    if (!form.cover_letter || !form.bid_amount || !form.estimated_days) return show("Please fill all fields", "error");
    if (form.cover_letter.length < 50) return show("Cover letter must be at least 50 characters", "error");
    if (!form.commitment || !form.experience || !form.delivery) return show("Please confirm all checkboxes", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setApplied(prev => [...prev, applyModal]);
    show("Application submitted successfully!", "success");
    setLoading(false);
    setApplyModal(null);
    setForm({ cover_letter: "", bid_amount: "", estimated_days: "", commitment: false, experience: false, delivery: false });
  };

  return (
    <div className="animate-fade">
      {applyModal && (
        <div className="overlay" onClick={() => setApplyModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Submit Proposal</h3>
            <p style={{ fontSize: 14, color: "var(--subtle)", marginBottom: 24 }}>Job: <strong>{MOCK_JOBS.find(j => j.id === applyModal)?.title}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Cover Letter (min 50 chars)" value={form.cover_letter} onChange={v => setForm({ ...form, cover_letter: v })} placeholder="Explain why you're the best candidate for this job..." rows={5} required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Bid Amount (KES)" type="number" value={form.bid_amount} onChange={v => setForm({ ...form, bid_amount: v })} required />
                <Input label="Estimated Days" type="number" value={form.estimated_days} onChange={v => setForm({ ...form, estimated_days: v })} required />
              </div>
              {[["commitment", "I commit to delivering this project on time and to the agreed specifications"], ["experience", "I confirm I have the required skills and experience for this job"], ["delivery", "I understand the escrow payment terms and delivery requirements"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} style={{ marginTop: 2, accentColor: "var(--emerald)" }} />
                  <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Btn loading={loading} onClick={handleApply}>Submit Proposal</Btn>
              <Btn variant="secondary" onClick={() => setApplyModal(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Find Jobs</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Browse and apply for available jobs.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="stagger">
        {MOCK_JOBS.filter(j => j.status === "open").map(job => {
          const isApplied = applied.includes(job.id);
          return (
            <Card key={job.id} className="card-hover">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700 }}>{job.title}</h3>
                    <Badge status="open" />
                  </div>
                  <p style={{ fontSize: 14, color: "var(--subtle)", marginBottom: 14, lineHeight: 1.6 }}>{job.description}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                    <span>💰 Budget: {fmtCurrency(job.budget_min)} – {fmtCurrency(job.budget_max)}</span>
                    <span>⏱ Duration: {job.duration_days} days</span>
                    <span>📤 {job.applications_count} proposals</span>
                  </div>
                  {job.skills && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(Array.isArray(job.skills) ? job.skills : job.skills.split(",")).map(s => <span key={s} className="tag">{s.trim()}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>
                  {isApplied ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--emerald-dark)", fontWeight: 600, fontSize: 14 }}>
                      <span>✓</span> Applied
                    </div>
                  ) : (
                    <Btn onClick={() => setApplyModal(job.id)}>Apply Now</Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FreelancerApplications({ user, show }) {
  const [apps] = useState([
    { id: 1, job_title: "Build React E-Commerce Dashboard", bid_amount: 65000, estimated_days: 12, status: "sent", created_at: "2026-02-19T10:00:00Z" },
    { id: 2, job_title: "Flutter Mobile App for Logistics", bid_amount: 85000, estimated_days: 25, status: "accepted", created_at: "2026-02-20T09:00:00Z" },
    { id: 3, job_title: "Data Pipeline Setup", bid_amount: 42000, estimated_days: 8, status: "rejected", created_at: "2026-02-15T08:00:00Z" },
  ]);
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>My Applications</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="stagger">
        {apps.map(a => (
          <Card key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{a.job_title}</h3>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--subtle)" }}>
                  <span>💰 Bid: {fmtCurrency(a.bid_amount)}</span>
                  <span>⏱ {a.estimated_days} days</span>
                  <span>📅 {fmtDate(a.created_at)}</span>
                </div>
              </div>
              <Badge status={a.status === "sent" ? "ASSESSMENT_SUBMITTED" : a.status === "accepted" ? "APPROVED" : "REJECTED"} label={a.status.charAt(0).toUpperCase() + a.status.slice(1)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FreelancerProjects({ user }) {
  const activeJob = MOCK_JOBS.find(j => j.status === "in_progress" && j.assigned_freelancer?.id === 4);
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Active Projects</h1>
      </div>
      {activeJob ? (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{activeJob.title}</h3>
              <Badge status="in_progress" />
            </div>
            <Badge status="escrow" />
          </div>
          <p style={{ fontSize: 14, color: "var(--subtle)", marginBottom: 20, lineHeight: 1.6 }}>{activeJob.description}</p>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--emerald-dark)" }}>{activeJob.progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${activeJob.progress}%` }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[["Budget", fmtCurrency(activeJob.budget_max)], ["Duration", `${activeJob.duration_days} days`], ["Status", "In Progress"]].map(([l, v]) => (
              <div key={l} style={{ padding: "12px", background: "var(--surface)", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card><Empty icon="📁" title="No active projects" sub="Apply for jobs to start working on projects" /></Card>
      )}
    </div>
  );
}

function FreelancerEarnings({ user }) {
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Earnings & Wallet</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="stagger">
        <StatCard label="Available Balance" value="KES 38.3K" icon="💰" color="var(--emerald)" />
        <StatCard label="Total Earned" value="KES 82.1K" icon="📈" color="var(--blue)" />
        <StatCard label="Pending (Escrow)" value="KES 45K" icon="🔒" color="var(--amber)" />
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Transaction History</h3>
          <Btn variant="secondary" size="sm" icon="↓">Withdraw</Btn>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Job</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{t.entry_type === "credit" ? "📥" : "📤"}</span>
                    <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{t.type.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{t.meta?.job_title || "—"}</td>
                <td style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: t.entry_type === "credit" ? "var(--emerald-dark)" : "var(--red)" }}>
                  {t.entry_type === "credit" ? "+" : "-"}{fmtCurrency(t.amount)}
                </td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{fmtDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function FreelancerProfile({ user, show }) {
  const [form, setForm] = useState({ name: user.name, skills: user.skills || "", experience: user.experience || "", availability: user.availability || "Full-time", country: user.country || "", bio: user.bio || "", portfolio_links: user.portfolio_links || "" });
  return (
    <div className="animate-fade" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>My Profile</h1>
      </div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
          <Avatar name={user.name} size={60} online={true} />
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{user.name}</h2>
            <p style={{ color: "var(--subtle)", fontSize: 14 }}>{user.email}</p>
            <Badge status={user.freelancer_status} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Country" value={form.country} onChange={v => setForm({ ...form, country: v })} />
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Skills" value={form.skills} onChange={v => setForm({ ...form, skills: v })} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Experience" value={form.experience} onChange={v => setForm({ ...form, experience: v })} rows={3} />
          </div>
          <Input label="Portfolio Link" value={form.portfolio_links} onChange={v => setForm({ ...form, portfolio_links: v })} />
          <Select label="Availability" value={form.availability} onChange={v => setForm({ ...form, availability: v })}
            options={[{ value: "Full-time", label: "Full-time" }, { value: "Part-time", label: "Part-time" }]} />
          <div style={{ gridColumn: "1/-1" }}>
            <Input label="Bio" value={form.bio} onChange={v => setForm({ ...form, bio: v })} rows={3} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn onClick={() => show("Profile updated!", "success")}>Save Changes</Btn>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// SUPPORT DASHBOARD
// ============================================================
function SupportDashboard({ user, activeView, onNavigate, show }) {
  const views = {
    dashboard: <SupportOverview onNavigate={onNavigate} />,
    support: <SupportTickets show={show} />,
    messages: <MessagesView role="support" show={show} />,
    users: <UserManagement show={show} />,
    reviews: <FreelancerReviews show={show} />,
    projects: <JobManagement show={show} />,
    content: <ContentManagement show={show} />,
  };
  return views[activeView] || views.dashboard;
}

function SupportOverview({ onNavigate }) {
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Support Dashboard</h1>
        <p style={{ color: "var(--subtle)", marginTop: 4 }}>Monitor and resolve user issues.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }} className="stagger">
        <StatCard label="Open Tickets" value="2" icon="🎫" color="var(--red)" />
        <StatCard label="In Progress" value="1" icon="⏳" color="var(--amber)" />
        <StatCard label="Resolved Today" value="5" icon="✅" color="var(--emerald)" />
        <StatCard label="Avg. Response" value="2.4h" icon="⚡" color="var(--blue)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Recent Tickets</h3>
          {MOCK_TICKETS.slice(0, 3).map(t => (
            <div key={t.id} onClick={() => onNavigate("support")}
              style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t.subject}</span>
                <Badge status={t.status} label={t.status} />
              </div>
              <div style={{ fontSize: 12, color: "var(--subtle)", marginTop: 4 }}>{t.user.name} · {fmtRelative(t.created_at)}</div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Quick Access</h3>
          {[["🎫 Manage Tickets", "support"], ["💬 View Messages", "messages"], ["🧑 User Management", "users"], ["👥 FR Reviews", "reviews"]].map(([label, key]) => (
            <div key={key} onClick={() => onNavigate(key)}
              style={{ padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 8, display: "flex", justifyContent: "space-between", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--emerald)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              {label} <span style={{ color: "var(--subtle)" }}>→</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ContentManagement({ show }) {
  const [pages] = useState([
    { id: 1, title: "How It Works", slug: "how-it-works", published: true, updated_at: "2026-02-10" },
    { id: 2, title: "Terms of Service", slug: "terms", published: true, updated_at: "2026-01-15" },
    { id: 3, title: "Privacy Policy", slug: "privacy", published: true, updated_at: "2026-01-15" },
    { id: 4, title: "FAQ Page", slug: "faq", published: false, updated_at: "2026-02-20" },
  ]);
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--midnight)" }}>Content Management</h1>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.title}</td>
                <td><code style={{ fontSize: 13, background: "var(--surface)", padding: "2px 6px", borderRadius: 4 }}>/{p.slug}</code></td>
                <td><Badge status={p.published ? "APPROVED" : "SUSPENDED"} label={p.published ? "Published" : "Draft"} /></td>
                <td style={{ color: "var(--subtle)", fontSize: 13 }}>{p.updated_at}</td>
                <td><Btn size="sm" variant="secondary" onClick={() => show("Opening editor...", "info")}>Edit</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function AfriGigApp() {
  const [screen, setScreen] = useState("landing"); // landing | auth | onboarding | app
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const { toasts, show } = useToast();
  const [notifCount, setNotifCount] = useState(3);

  const handleAuth = (mode) => {
    setAuthMode(mode);
    setScreen("auth");
  };

  const handleLogin = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    if (userRole === "freelancer" && userData.freelancer_status !== "APPROVED") {
      setScreen("onboarding");
    } else {
      setScreen("app");
      setActiveView("dashboard");
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleOnboardingComplete = () => {
    setScreen("app");
    setActiveView("dashboard");
    show("Welcome to AfriGig! Your account is now active.", "success");
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setScreen("landing");
    setActiveView("dashboard");
  };

  if (screen === "landing") return <LandingPage onAuth={handleAuth} />;
  if (screen === "auth") return <AuthPage mode={authMode} onLogin={handleLogin} />;
  if (screen === "onboarding") return <OnboardingFlow user={user} onUpdate={handleUpdateUser} onComplete={handleOnboardingComplete} />;

  // Main App Layout
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <ToastDisplay toasts={toasts} />

      <Sidebar role={role} activeKey={activeView} onNavigate={(key) => { setActiveView(key); }} user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ height: 60, background: "white", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 28px", gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => { setNotifCount(0); show("All notifications marked as read", "info"); }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            {notifCount > 0 && (
              <div style={{ position: "absolute", top: -4, right: -6, background: "var(--red)", color: "white", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 5px", border: "2px solid white" }}>{notifCount}</div>
            )}
          </div>
          <Avatar name={user?.name} online={true} size={34} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--subtle)", textTransform: "capitalize" }}>{role}</div>
          </div>
        </div>

        {/* Page Content */}
        <div key={activeView} style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {role === "admin" && <AdminDashboard user={user} activeView={activeView} onNavigate={setActiveView} show={show} />}
          {role === "support" && <SupportDashboard user={user} activeView={activeView} onNavigate={setActiveView} show={show} />}
          {role === "freelancer" && <FreelancerDashboard user={user} activeView={activeView} onNavigate={setActiveView} show={show} />}
        </div>
      </div>
    </div>
  );
}
