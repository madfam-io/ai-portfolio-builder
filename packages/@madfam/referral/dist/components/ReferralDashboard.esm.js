import { jsx, jsxs } from 'react/jsx-runtime';
import { useReferral } from '../hooks/useReferral.esm.js';

function ReferralDashboard({ userId, className = "" }) {
  const {
    stats,
    activeReferral,
    loading,
    error,
    createReferral,
    copyShareLink
  } = useReferral({ userId });
  if (loading) return /* @__PURE__ */ jsx("div", { className, children: "Loading..." });
  if (error) return /* @__PURE__ */ jsxs("div", { className, children: [
    "Error: ",
    error.message
  ] });
  return /* @__PURE__ */ jsxs("div", { className: `referral-dashboard ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsx("h3", { children: "Total Referrals" }),
        /* @__PURE__ */ jsx("p", { children: stats?.total_referrals || 0 })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsx("h3", { children: "Successful" }),
        /* @__PURE__ */ jsx("p", { children: stats?.successful_referrals || 0 })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsx("h3", { children: "Total Earned" }),
        /* @__PURE__ */ jsxs("p", { children: [
          "$",
          stats?.total_rewards_earned || 0
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsx("h3", { children: "Conversion Rate" }),
        /* @__PURE__ */ jsxs("p", { children: [
          ((stats?.conversion_rate || 0) * 100).toFixed(2),
          "%"
        ] })
      ] })
    ] }),
    activeReferral ? /* @__PURE__ */ jsxs("div", { className: "active-referral", children: [
      /* @__PURE__ */ jsx("h3", { children: "Your Referral Code" }),
      /* @__PURE__ */ jsx("code", { children: activeReferral.code }),
      /* @__PURE__ */ jsx("button", { onClick: () => copyShareLink(), children: "Copy Link" })
    ] }) : /* @__PURE__ */ jsx("button", { onClick: () => createReferral(), children: "Create Referral Link" })
  ] });
}

export { ReferralDashboard };
