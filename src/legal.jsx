/**
 * AfriGig Legal Components
 * Terms of Service, Privacy Policy, Refund Policy
 * Legally-binding, Kenya-compliant. Last updated: March 2026.
 */

import { useState } from "react";

// ─── TERMS OF SERVICE ─────────────────────────────────────────
const TOS_TEXT = {
  title: "Terms of Service",
  effective: "15 March 2026",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: `By registering, accessing, or using the AfriGig platform ("Platform"), you ("User") agree to be legally bound by these Terms of Service ("Terms"). If you do not agree to all Terms, you must not use the Platform. These Terms constitute a binding legal agreement between you and AfriGig Technologies Ltd ("AfriGig", "we", "us").`,
    },
    {
      heading: "2. Platform Description",
      body: `AfriGig is an Africa-focused talent marketplace where the Administrator and authorised Support Team post jobs and projects on behalf of employers ("Clients"). Verified freelancers ("Freelancers") submit proposals and complete work through the Platform. AfriGig acts solely as an intermediary facilitating connections and payment processing.`,
    },
    {
      heading: "3. Assessment Fee — NON-REFUNDABLE",
      body: `To access skill assessments, Freelancers must pay a one-time, non-refundable Assessment Fee. The fee per track is:\n\n• Software Development & DevOps: KES 1,500\n• Data & Analytics: KES 1,500\n• UI/UX Design: KES 1,200\n• Technical Writing & Non-Technical: KES 1,000\n\nTHIS FEE IS STRICTLY NON-REFUNDABLE regardless of assessment outcome (pass or fail), technical interruption, or account closure. The fee covers the cost of expert review, question delivery infrastructure, and AI-assisted analysis. By proceeding with payment, you irrevocably acknowledge and accept this non-refundable policy. No exceptions will be made.`,
    },
    {
      heading: "4. Platform Service Fee / Commission",
      body: `AfriGig charges a service commission deducted from each payment released to a Freelancer. Commission rates are tiered by Freelancer badge level:\n\n• Bronze: 15% of project value\n• Silver: 12% of project value\n• Gold: 10% of project value\n• Elite: 8% of project value\n\nCommission is deducted automatically at the time of escrow release. The Freelancer acknowledges and consents to this deduction as a condition of Platform use.`,
    },
    {
      heading: "5. Escrow & Payments",
      body: `All project payments are held in escrow by AfriGig until the Client/Admin approves deliverables. Funds are released to the Freelancer's wallet only upon explicit approval. AfriGig is not liable for delays in approval caused by the Client. Withdrawal of wallet funds is subject to KYC verification and may incur a withdrawal processing fee of 2% or KES 50 (whichever is greater).`,
    },
    {
      heading: "6. Withdrawal & Payout Policy",
      body: `Freelancers may withdraw wallet balances via M-Pesa B2C transfer. Minimum withdrawal amount is KES 500. Withdrawals above KES 10,000 require Admin approval within 2 business days. A processing fee of 2% (min KES 50) applies. AfriGig processes payouts within 24–72 hours on business days. AfriGig is not responsible for delays caused by mobile network operators or banking systems.`,
    },
    {
      heading: "7. Non-Circumvention",
      body: `Freelancers and Clients agree not to conduct business directly (circumventing the Platform) for any project introduced through AfriGig for a period of 12 months from initial contact. Violation of this clause entitles AfriGig to a penalty equal to 30% of the estimated project value, plus legal costs.`,
    },
    {
      heading: "8. Intellectual Property",
      body: `Upon full payment and release of escrow funds, all work product, deliverables, and intellectual property produced by the Freelancer for a specific project are assigned to and owned by the Client, unless otherwise agreed in writing. The Freelancer retains no rights to deliverables after payment is released.`,
    },
    {
      heading: "9. User Conduct & Prohibited Activities",
      body: `Users must not: (a) provide false information during registration or KYC; (b) share account credentials; (c) submit plagiarised or AI-generated assessment responses; (d) harass, threaten, or defame other users; (e) manipulate the rating or review system; (f) use the Platform for illegal activities; (g) reverse-engineer Platform code or systems.`,
    },
    {
      heading: "10. Account Suspension & Termination",
      body: `AfriGig reserves the right to suspend, restrict, or permanently terminate any account at its sole discretion for violation of these Terms, fraudulent activity, KYC failure, or conduct detrimental to the Platform. Upon termination, any wallet balance above KES 500 will be paid out after a 30-day review period. Assessment fees, subscription fees, and platform commissions are non-refundable upon termination.`,
    },
    {
      heading: "11. Dispute Resolution",
      body: `Disputes between Freelancers and Clients must be submitted through the AfriGig Support Ticket system within 14 days of delivery. AfriGig will investigate and issue a binding resolution within 5 business days. AfriGig's decision is final. AfriGig may retain up to 10% of the disputed amount as an arbitration fee. Disputes must be submitted in writing; verbal claims will not be considered.`,
    },
    {
      heading: "12. Limitation of Liability",
      body: `AfriGig's total liability for any claim shall not exceed the total fees paid by you to AfriGig in the 3 months preceding the claim. AfriGig is not liable for indirect, incidental, special, or consequential damages, including loss of profit, loss of data, or business interruption, even if advised of the possibility.`,
    },
    {
      heading: "13. Governing Law & Jurisdiction",
      body: `These Terms are governed by the laws of the Republic of Kenya. Any disputes not resolved through the Platform's dispute mechanism shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.`,
    },
    {
      heading: "14. Data Protection",
      body: `AfriGig collects and processes personal data in accordance with the Kenya Data Protection Act 2019. See our Privacy Policy for details. By using the Platform, you consent to the collection and processing of your data as described therein.`,
    },
    {
      heading: "15. Amendments",
      body: `AfriGig may amend these Terms at any time. Users will be notified of material changes via email or Platform notification. Continued use of the Platform after notification constitutes acceptance of the revised Terms.`,
    },
  ],
};

// ─── PRIVACY POLICY ────────────────────────────────────────────
const PRIVACY_TEXT = {
  title: "Privacy Policy",
  effective: "15 March 2026",
  sections: [
    {
      heading: "1. Data Controller",
      body: `AfriGig Technologies Ltd is the data controller for personal data collected through the Platform, in compliance with the Kenya Data Protection Act 2019.`,
    },
    {
      heading: "2. Data We Collect",
      body: `We collect: (a) Identity data: name, national ID, date of birth; (b) Contact data: email, phone number; (c) Professional data: skills, experience, portfolio, assessment scores; (d) Financial data: M-Pesa phone number, wallet balance, transaction history; (e) KYC data: government ID images, selfie photos; (f) Usage data: login times, activity logs, live presence data; (g) Technical data: IP address, device type, browser.`,
    },
    {
      heading: "3. How We Use Your Data",
      body: `We use your data to: verify your identity (KYC); process payments and payouts; deliver the freelancing marketplace service; communicate updates, decisions, and notifications; detect fraud and ensure platform security; comply with legal obligations; and improve Platform features.`,
    },
    {
      heading: "4. M-Pesa & Payment Data",
      body: `M-Pesa transactions are processed via Safaricom Daraja API. We store transaction references and amounts. We do NOT store M-Pesa PINs or card details. Payment data is transmitted securely and retained for 7 years as required by Kenya Revenue Authority regulations.`,
    },
    {
      heading: "5. Data Sharing",
      body: `We share data with: Supabase (database hosting); Safaricom Daraja (payment processing); Resend/email providers (transactional emails); Sentry (error monitoring). We do not sell your personal data to third parties. All data processors are bound by confidentiality agreements.`,
    },
    {
      heading: "6. Data Retention",
      body: `Active account data is retained for the duration of your account. Upon account deletion: profile data deleted within 30 days; financial records retained for 7 years (legal requirement); assessment data retained for 3 years.`,
    },
    {
      heading: "7. Your Rights",
      body: `Under Kenya DPA 2019, you have the right to: access your data; correct inaccurate data; request deletion (subject to legal retention requirements); object to processing; data portability. Submit requests to: privacy@afrigig.com.`,
    },
    {
      heading: "8. Security",
      body: `We use AES-256 encryption for data at rest, TLS 1.3 for data in transit, row-level security on all database tables, and regular security audits. KYC documents are stored in private encrypted storage accessible only to authorised administrators.`,
    },
    {
      heading: "9. Cookies",
      body: `We use essential cookies for session management and authentication. We do not use advertising or tracking cookies. You may disable cookies in your browser, but this may impair Platform functionality.`,
    },
    {
      heading: "10. Contact",
      body: `Data Protection Officer: privacy@afrigig.com\nGeneral: support@afrigig.com\nAddress: AfriGig Technologies Ltd, Nairobi, Kenya`,
    },
  ],
};

// ─── REFUND POLICY ─────────────────────────────────────────────
export const REFUND_POLICY_SUMMARY = `Assessment fees, subscription fees, and bid boost credits are STRICTLY NON-REFUNDABLE once processed. Escrow funds may be refunded only if: (a) the project is cancelled before any work begins; (b) the Freelancer fails to deliver within the agreed timeline; (c) AfriGig rules in the Client's favour after a formal dispute. Platform commissions are non-refundable under all circumstances.`;

// ─── SHARED MODAL COMPONENT ────────────────────────────────────
function LegalModal({ doc, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 720, padding: 0, maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 28px",
            borderBottom: "1px solid var(--bdr)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 2,
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 20 }}>
              {doc.title}
            </h2>
            <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 3 }}>
              Effective date: {doc.effective}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surf)",
              border: "1px solid var(--bdr)",
              borderRadius: 8,
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--sub)",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontFamily: "var(--fh)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--navy)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {s.heading}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--mu)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--bdr)",
            background: "var(--surf)",
            borderRadius: "0 0 16px 16px",
            position: "sticky",
            bottom: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              background: "var(--g)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--fh)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORTED HOOKS & COMPONENTS ───────────────────────────────

export function useLegal() {
  const [showTos, setShowTos] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  return {
    showTos,
    showPrivacy,
    openTos: () => setShowTos(true),
    closeTos: () => setShowTos(false),
    openPrivacy: () => setShowPrivacy(true),
    closePrivacy: () => setShowPrivacy(false),
  };
}

export function LegalModals({ showTos, showPrivacy, closeTos, closePrivacy }) {
  return (
    <>
      {showTos && <LegalModal doc={TOS_TEXT} onClose={closeTos} />}
      {showPrivacy && <LegalModal doc={PRIVACY_TEXT} onClose={closePrivacy} />}
    </>
  );
}

/**
 * T&C checkbox block — embed in signup forms.
 * Props: agreed (bool), onToggle (fn), openTos (fn), openPrivacy (fn)
 */
export function TosCheckbox({ agreed, onToggle, openTos, openPrivacy, error }) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={onToggle}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--g)", flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, color: "var(--mu)", lineHeight: 1.65 }}>
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={e => { e.preventDefault(); openTos(); }}
            style={{ background: "none", border: "none", color: "var(--g)", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: 0 }}
          >
            Terms of Service
          </button>
          {" "}and{" "}
          <button
            type="button"
            onClick={e => { e.preventDefault(); openPrivacy(); }}
            style={{ background: "none", border: "none", color: "var(--g)", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: 0 }}
          >
            Privacy Policy
          </button>
          . I understand these are legally binding.
        </span>
      </label>
      {error && (
        <p style={{ fontSize: 12, color: "var(--err)", marginTop: 5, marginLeft: 26 }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Non-refundable notice block — embed before assessment payment button.
 */
export function NonRefundableNotice({ agreed, onToggle, fee, track }) {
  return (
    <div
      style={{
        background: "#FEF2F2",
        border: "1.5px solid #FECACA",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: agreed ? 12 : 0,
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: "#991B1B", marginBottom: 4 }}>
            Assessment Fee: NON-REFUNDABLE
          </p>
          <p style={{ fontSize: 12.5, color: "#B91C1C", lineHeight: 1.65 }}>
            The KES {fee?.toLocaleString()} {track ? `${track} ` : ""}assessment fee is{" "}
            <strong>strictly non-refundable</strong> regardless of your result (pass or fail),
            technical issues, or account status changes. By proceeding, you irrevocably waive
            any right to a refund as per AfriGig's Terms of Service (Section 3).
          </p>
        </div>
      </div>
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          userSelect: "none",
          marginTop: 10,
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={onToggle}
          style={{ width: 15, height: 15, marginTop: 2, accentColor: "#DC2626", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12.5, color: "#991B1B", lineHeight: 1.6 }}>
          I acknowledge that the KES {fee?.toLocaleString()} assessment fee is{" "}
          <strong>non-refundable</strong> and I consent to this charge.
        </span>
      </label>
    </div>
  );
}

/**
 * Footer legal links component.
 */
export function LegalFooter({ openTos, openPrivacy, dark = false }) {
  const col = dark ? "rgba(255,255,255,0.3)" : "var(--sub)";
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        ["Terms of Service", openTos],
        ["Privacy Policy", openPrivacy],
        ["Refund Policy", null],
        ["Contact", null],
      ].map(([label, fn]) => (
        <button
          key={label}
          type="button"
          onClick={fn || undefined}
          style={{
            background: "none",
            border: "none",
            color: col,
            cursor: fn ? "pointer" : "default",
            fontSize: 13,
            fontWeight: 500,
            padding: 0,
            textDecoration: fn ? "underline" : "none",
            textUnderlineOffset: 3,
          }}
        >
          {label}
        </button>
      ))}
      <span style={{ color: col, fontSize: 12 }}>
        © {new Date().getFullYear()} AfriGig Technologies Ltd · Nairobi, Kenya
      </span>
    </div>
  );
}
