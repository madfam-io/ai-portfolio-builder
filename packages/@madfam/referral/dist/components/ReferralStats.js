'use strict';

var jsxRuntime = require('react/jsx-runtime');
var useReferralStats = require('../hooks/useReferralStats.js');

function ReferralStats({ userId, className = "" }) {
  const { stats, loading, error } = useReferralStats.useReferralStats({ userId });
  if (loading) return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "Loading stats..." });
  if (error) return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "Error loading stats" });
  if (!stats) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `referral-stats ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Your Performance" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Total Referrals" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-value", children: stats.total_referrals }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-label", children: "All time" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Success Rate" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "stat-value", children: [
          ((stats.conversion_rate || 0) * 100).toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-label", children: "Conversion" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Total Earned" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "stat-value", children: [
          "$",
          stats.total_rewards_earned
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-label", children: "Lifetime" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Current Streak" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-value", children: stats.current_streak }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "stat-label", children: "Days" })
      ] })
    ] }),
    stats.achievement_badges.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "achievements", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Achievements" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "badges", children: stats.achievement_badges.map((badge) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "badge", children: badge }, badge)) })
    ] }),
    stats.referral_rank && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rank", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h4", { children: "Your Rank" }),
      /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "rank-value", children: [
        "#",
        stats.referral_rank
      ] })
    ] })
  ] });
}

exports.ReferralStats = ReferralStats;
