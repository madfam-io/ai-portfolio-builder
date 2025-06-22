'use strict';

var jsxRuntime = require('react/jsx-runtime');
var useReferral = require('../hooks/useReferral.js');

function ReferralDashboard({ userId, className = "" }) {
  const {
    stats,
    activeReferral,
    loading,
    error,
    createReferral,
    copyShareLink
  } = useReferral.useReferral({ userId });
  if (loading) return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "Loading..." });
  if (error) return /* @__PURE__ */ jsxRuntime.jsxs("div", { className, children: [
    "Error: ",
    error.message
  ] });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `referral-dashboard ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Total Referrals" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { children: stats?.total_referrals || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Successful" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { children: stats?.successful_referrals || 0 })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Total Earned" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
          "$",
          stats?.total_rewards_earned || 0
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Conversion Rate" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
          ((stats?.conversion_rate || 0) * 100).toFixed(2),
          "%"
        ] })
      ] })
    ] }),
    activeReferral ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "active-referral", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Your Referral Code" }),
      /* @__PURE__ */ jsxRuntime.jsx("code", { children: activeReferral.code }),
      /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => copyShareLink(), children: "Copy Link" })
    ] }) : /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => createReferral(), children: "Create Referral Link" })
  ] });
}

exports.ReferralDashboard = ReferralDashboard;
