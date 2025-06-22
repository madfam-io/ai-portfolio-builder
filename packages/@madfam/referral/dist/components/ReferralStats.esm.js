import { jsx, jsxs } from 'react/jsx-runtime';
import { useReferralStats } from '../hooks/useReferralStats.esm.js';

function ReferralStats({ userId, className = "" }) {
  const { stats, loading, error } = useReferralStats({ userId });
  if (loading) return /* @__PURE__ */ jsx("div", { className, children: "Loading stats..." });
  if (error) return /* @__PURE__ */ jsx("div", { className, children: "Error loading stats" });
  if (!stats) return null;
  return /* @__PURE__ */ jsxs("div", { className: `referral-stats ${className}`, children: [
    /* @__PURE__ */ jsx("h3", { children: "Your Performance" }),
    /* @__PURE__ */ jsxs("div", { className: "stats-grid", children: [
      /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsx("h4", { children: "Total Referrals" }),
        /* @__PURE__ */ jsx("p", { className: "stat-value", children: stats.total_referrals }),
        /* @__PURE__ */ jsx("p", { className: "stat-label", children: "All time" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsx("h4", { children: "Success Rate" }),
        /* @__PURE__ */ jsxs("p", { className: "stat-value", children: [
          ((stats.conversion_rate || 0) * 100).toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "stat-label", children: "Conversion" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsx("h4", { children: "Total Earned" }),
        /* @__PURE__ */ jsxs("p", { className: "stat-value", children: [
          "$",
          stats.total_rewards_earned
        ] }),
        /* @__PURE__ */ jsx("p", { className: "stat-label", children: "Lifetime" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
        /* @__PURE__ */ jsx("h4", { children: "Current Streak" }),
        /* @__PURE__ */ jsx("p", { className: "stat-value", children: stats.current_streak }),
        /* @__PURE__ */ jsx("p", { className: "stat-label", children: "Days" })
      ] })
    ] }),
    stats.achievement_badges.length > 0 && /* @__PURE__ */ jsxs("div", { className: "achievements", children: [
      /* @__PURE__ */ jsx("h4", { children: "Achievements" }),
      /* @__PURE__ */ jsx("div", { className: "badges", children: stats.achievement_badges.map((badge) => /* @__PURE__ */ jsx("span", { className: "badge", children: badge }, badge)) })
    ] }),
    stats.referral_rank && /* @__PURE__ */ jsxs("div", { className: "rank", children: [
      /* @__PURE__ */ jsx("h4", { children: "Your Rank" }),
      /* @__PURE__ */ jsxs("p", { className: "rank-value", children: [
        "#",
        stats.referral_rank
      ] })
    ] })
  ] });
}

export { ReferralStats };
