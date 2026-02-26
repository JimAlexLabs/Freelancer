/**
 * AfriGig Backend Layer – decentralized in-memory store + API.
 * Single source of truth; syncs with frontend via subscribe() so they operate as one component.
 * Frontend reads from store (getState) and mutates via this API; subscribe() triggers re-renders.
 * Replace this module with real API calls later without changing frontend contract.
 */

const INITIAL_FREELANCERS = [
  { id: 2, name: "Amara Osei", email: "amara@gmail.com", country: "Ghana", skills: "React, TypeScript, Node.js", freelancer_status: "UNDER_REVIEW", status: "pending", assessment_score: 87, assessment_percentage: 87, assessment_submitted_at: "2026-02-10T09:00:00Z", review_queue_position: 1, bio: "5 years of full-stack development experience.", portfolio_links: "https://amaraosei.dev", experience: "Senior Developer at TechCo Ghana", availability: "Full-time", avatar: null, is_online: true },
  { id: 3, name: "Fatima Diallo", email: "fatima@outlook.com", country: "Senegal", skills: "Python, Django, PostgreSQL", freelancer_status: "UNDER_REVIEW", status: "pending", assessment_score: 92, assessment_percentage: 92, assessment_submitted_at: "2026-02-12T11:30:00Z", review_queue_position: 2, bio: "Backend specialist with data engineering background.", portfolio_links: "https://github.com/fatima-dev", experience: "Lead Backend Engineer at Dakar Fintech", availability: "Full-time", avatar: null, is_online: false },
  { id: 4, name: "Kwame Mensah", email: "kwame@gmail.com", country: "Kenya", skills: "Flutter, Dart, Firebase", freelancer_status: "APPROVED", status: "active", assessment_score: 78, assessment_percentage: 78, assessment_submitted_at: "2026-02-01T08:00:00Z", review_queue_position: null, bio: "Mobile developer specializing in cross-platform apps.", portfolio_links: "https://kwamemensh.com", experience: "2 years mobile dev", availability: "Part-time", avatar: null, is_online: true },
  { id: 5, name: "Ngozi Adeyemi", email: "ngozi@yahoo.com", country: "Nigeria", skills: "UI/UX, Figma, React", freelancer_status: "ASSESSMENT_PENDING", status: "pending", assessment_score: null, assessment_percentage: null, assessment_submitted_at: null, review_queue_position: null, bio: "Product designer with dev skills.", portfolio_links: "https://ngozid.co", experience: "3 years design", availability: "Full-time", avatar: null, is_online: false },
  { id: 6, name: "Tariq Hassan", email: "tariq@gmail.com", country: "Tanzania", skills: "Vue.js, Laravel, MySQL", freelancer_status: "REJECTED", status: "banned", assessment_score: 45, assessment_percentage: 45, assessment_submitted_at: "2026-01-25T14:00:00Z", review_queue_position: null, bio: "Junior developer.", portfolio_links: "", experience: "1 year", availability: "Full-time", avatar: null, is_online: false },
];

const INITIAL_JOBS = [
  { id: 1, title: "Build React E-Commerce Dashboard", category: "Web Development", budget_min: 50000, budget_max: 80000, duration_days: 14, status: "open", payment_status: "unpaid", created_at: "2026-02-18T10:00:00Z", applications_count: 5, description: "Create a comprehensive e-commerce admin dashboard with analytics, order management, and inventory tracking using React and TypeScript.", assigned_freelancer: null, progress: 0, skills: ["React", "TypeScript", "Tailwind"] },
  { id: 2, title: "M-Pesa Payment Integration API", category: "Backend", budget_min: 30000, budget_max: 45000, duration_days: 7, status: "in_progress", payment_status: "escrow", created_at: "2026-02-10T08:00:00Z", applications_count: 8, description: "Integrate M-Pesa STK Push payment gateway with existing Laravel application. Handle webhooks, callbacks, and transaction reconciliation.", assigned_freelancer: { id: 4, name: "Kwame Mensah" }, progress: 65, skills: ["Laravel", "PHP", "M-Pesa"] },
  { id: 3, title: "Flutter Mobile App for Logistics", category: "Mobile", budget_min: 70000, budget_max: 100000, duration_days: 30, status: "open", payment_status: "unpaid", created_at: "2026-02-20T09:00:00Z", applications_count: 3, description: "Build a cross-platform logistics tracking app with real-time GPS, route optimization, and delivery management.", assigned_freelancer: null, progress: 0, skills: ["Flutter", "Firebase", "Google Maps"] },
  { id: 4, title: "Data Pipeline & Analytics Setup", category: "Data Engineering", budget_min: 40000, budget_max: 60000, duration_days: 10, status: "completed", payment_status: "released", created_at: "2026-01-15T07:00:00Z", applications_count: 6, description: "Set up ETL pipeline and analytics dashboard for fintech startup.", assigned_freelancer: { id: 3, name: "Fatima Diallo" }, progress: 100, skills: ["Python", "PostgreSQL", "dbt"] },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, type: "escrow_hold", entry_type: "credit", amount: 45000, currency: "KES", status: "completed", created_at: "2026-02-10T08:30:00Z", reference: "ESC-001", meta: { job_title: "M-Pesa Payment Integration API" } },
  { id: 2, type: "escrow_release", entry_type: "credit", amount: 38250, currency: "KES", status: "completed", created_at: "2026-02-19T14:00:00Z", reference: "REL-001", meta: { job_title: "Data Pipeline & Analytics" } },
  { id: 3, type: "commission", entry_type: "debit", amount: 3825, currency: "KES", status: "completed", created_at: "2026-02-19T14:01:00Z", reference: "COM-001", meta: {} },
  { id: 4, type: "deposit", entry_type: "credit", amount: 80000, currency: "KES", status: "completed", created_at: "2026-02-18T11:00:00Z", reference: "DEP-001", meta: {} },
];

const INITIAL_TICKETS = [
  { id: 1, subject: "Unable to submit assessment", message: "I get an error when I try to submit my assessment. The page crashes after answering Q12.", status: "open", priority: "high", user: { name: "Ngozi Adeyemi" }, created_at: "2026-02-21T10:00:00Z" },
  { id: 2, subject: "Payment not reflecting", message: "I paid the assessment fee via M-Pesa but my status hasn't changed.", status: "in_progress", priority: "high", user: { name: "Tariq Hassan" }, created_at: "2026-02-20T14:00:00Z" },
  { id: 3, subject: "Profile update not saving", message: "When I update my portfolio link, it doesn't save properly.", status: "resolved", priority: "low", user: { name: "Amara Osei" }, created_at: "2026-02-19T09:00:00Z" },
];

const INITIAL_MESSAGES = [
  { id: 1, sender: { name: "Amara Osei", id: 2 }, body: "Hi! I just submitted my proposal for the React dashboard project. Looking forward to hearing back!", created_at: "2026-02-21T11:30:00Z", read: false, job_title: "Build React E-Commerce Dashboard" },
  { id: 2, sender: { name: "Kwame Mensah", id: 4 }, body: "The M-Pesa integration is 65% done. I've completed the STK Push and callback handling. Working on reconciliation now.", created_at: "2026-02-21T09:15:00Z", read: true, job_title: "M-Pesa Payment Integration API" },
  { id: 3, sender: { name: "Fatima Diallo", id: 3 }, body: "The data pipeline is live. All tests are passing and the analytics dashboard is ready for review.", created_at: "2026-02-20T16:45:00Z", read: true, job_title: "Data Pipeline & Analytics Setup" },
];

const INITIAL_ESCROWS = [
  { id: 1, job_id: 2, job_title: "M-Pesa Payment Integration API", amount: 45000, status: "holding", freelancer: "Kwame Mensah", created_at: "2026-02-10T08:30:00Z" },
  { id: 2, job_id: 3, job_title: "Flutter Mobile App for Logistics", amount: 85000, status: "holding", freelancer: null, created_at: "2026-02-21T10:00:00Z" },
];

const INITIAL_MESSAGE_THREADS = {
  1: [
    { id: 1, sender: "Amara Osei", body: "Hi! I just submitted my proposal for the React dashboard project.", time: "11:30 AM", mine: false },
    { id: 2, sender: "You", body: "Thanks Amara! We'll review it shortly. Your profile looks impressive.", time: "11:45 AM", mine: true },
    { id: 3, sender: "Amara Osei", body: "Appreciate it! Happy to do a quick call if needed.", time: "12:00 PM", mine: false },
  ],
};

const INITIAL_APPLICATIONS = [
  { id: 1, job_id: 1, job_title: "Build React E-Commerce Dashboard", user_id: 4, bid_amount: 65000, estimated_days: 12, status: "sent", created_at: "2026-02-19T10:00:00Z" },
  { id: 2, job_id: 3, job_title: "Flutter Mobile App for Logistics", user_id: 4, bid_amount: 85000, estimated_days: 25, status: "accepted", created_at: "2026-02-20T09:00:00Z" },
  { id: 3, job_id: 4, job_title: "Data Pipeline Setup", user_id: 4, bid_amount: 42000, estimated_days: 8, status: "rejected", created_at: "2026-02-15T08:00:00Z" },
];

export const ASSESSMENT_QUESTIONS = [
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

function shallowCopy(obj) {
  return { ...obj };
}

function emit(store) {
  store._listeners.forEach((fn) => fn(store.getState()));
}

export function createBackend() {
  const state = {
    freelancers: INITIAL_FREELANCERS.map(shallowCopy),
    jobs: INITIAL_JOBS.map((j) => ({ ...j, skills: j.skills ? [...j.skills] : [] })),
    transactions: INITIAL_TRANSACTIONS.map(shallowCopy),
    tickets: INITIAL_TICKETS.map(shallowCopy),
    messages: INITIAL_MESSAGES.map(shallowCopy),
    escrows: INITIAL_ESCROWS.map(shallowCopy),
    messageThreads: { ...INITIAL_MESSAGE_THREADS },
    applications: INITIAL_APPLICATIONS.map(shallowCopy),
  };

  state._listeners = [];

  function getState() {
    return {
      freelancers: state.freelancers,
      jobs: state.jobs,
      transactions: state.transactions,
      tickets: state.tickets,
      messages: state.messages,
      escrows: state.escrows,
      messageThreads: state.messageThreads,
      applications: state.applications,
    };
  }

  function subscribe(listener) {
    state._listeners.push(listener);
    return () => {
      state._listeners = state._listeners.filter((l) => l !== listener);
    };
  }

  function updateFreelancer(id, patch) {
    const i = state.freelancers.findIndex((f) => f.id === id);
    if (i === -1) return;
    state.freelancers[i] = { ...state.freelancers[i], ...patch };
    emit({ getState, _listeners: state._listeners });
  }

  function createJob(payload) {
    const job = {
      id: typeof Date.now === "function" ? Date.now() : state.jobs.length + 100,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      budget_min: Number(payload.budget_min) || 0,
      budget_max: Number(payload.budget_max),
      duration_days: Number(payload.duration_days) || 0,
      status: "open",
      payment_status: "unpaid",
      created_at: new Date().toISOString(),
      applications_count: 0,
      assigned_freelancer: null,
      progress: 0,
      skills: Array.isArray(payload.skills) ? payload.skills : (payload.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    state.jobs.unshift(job);
    emit({ getState, _listeners: state._listeners });
    return job;
  }

  function updateEscrow(id, patch) {
    const i = state.escrows.findIndex((e) => e.id === id);
    if (i === -1) return;
    state.escrows[i] = { ...state.escrows[i], ...patch };
    emit({ getState, _listeners: state._listeners });
  }

  function addEscrow(escrow) {
    const e = { ...escrow, id: (state.escrows.length + 1) * 10 + 1 };
    state.escrows.push(e);
    emit({ getState, _listeners: state._listeners });
  }

  function addTransaction(tx) {
    state.transactions.push({ ...tx, id: state.transactions.length + 1 });
    emit({ getState, _listeners: state._listeners });
  }

  function updateTicket(id, patch) {
    const i = state.tickets.findIndex((t) => t.id === id);
    if (i === -1) return;
    state.tickets[i] = { ...state.tickets[i], ...patch };
    emit({ getState, _listeners: state._listeners });
  }

  function getMessageThread(conversationId) {
    return state.messageThreads[conversationId] || [];
  }

  function appendToMessageThread(conversationId, message) {
    const key = String(conversationId);
    const list = state.messageThreads[key] ? [...state.messageThreads[key]] : [];
    list.push(message);
    state.messageThreads[key] = list;
    emit({ getState, _listeners: state._listeners });
  }

  function addApplication(payload) {
    const job = state.jobs.find((j) => j.id === payload.job_id);
    const app = {
      id: state.applications.length + 100,
      job_id: payload.job_id,
      job_title: job ? job.title : "",
      user_id: payload.user_id,
      bid_amount: Number(payload.bid_amount),
      estimated_days: Number(payload.estimated_days),
      status: "sent",
      created_at: new Date().toISOString(),
    };
    state.applications.push(app);
    if (job) {
      const ji = state.jobs.findIndex((j) => j.id === payload.job_id);
      if (ji !== -1) state.jobs[ji] = { ...state.jobs[ji], applications_count: (state.jobs[ji].applications_count || 0) + 1 };
    }
    emit({ getState, _listeners: state._listeners });
    return app;
  }

  function getAppliedJobIds(userId) {
    return state.applications.filter((a) => a.user_id === userId).map((a) => a.job_id);
  }

  function getApplicationsForUser(userId) {
    return state.applications.filter((a) => a.user_id === userId);
  }

  return {
    getState,
    subscribe,
    updateFreelancer,
    createJob,
    updateEscrow,
    addEscrow,
    addTransaction,
    updateTicket,
    getMessageThread,
    appendToMessageThread,
    addApplication,
    getAppliedJobIds,
    getApplicationsForUser,
  };
}

export default createBackend;
