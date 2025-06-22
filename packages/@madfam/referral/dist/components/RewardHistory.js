'use strict';

var jsxRuntime = require('react/jsx-runtime');
var useReferral = require('../hooks/useReferral.js');

function RewardHistory({ userId, limit = 10, className = "" }) {
  const { rewards, totalEarnings, pendingRewards } = useReferral.useReferral({ userId });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `reward-history ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Reward History" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "reward-summary", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Total Earned:" }),
        /* @__PURE__ */ jsxRuntime.jsxs("strong", { children: [
          "$",
          totalEarnings.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Pending:" }),
        /* @__PURE__ */ jsxRuntime.jsxs("strong", { children: [
          "$",
          pendingRewards.toFixed(2)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "rewards-table", children: [
      /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("th", { children: "Type" }),
        /* @__PURE__ */ jsxRuntime.jsx("th", { children: "Amount" }),
        /* @__PURE__ */ jsxRuntime.jsx("th", { children: "Status" }),
        /* @__PURE__ */ jsxRuntime.jsx("th", { children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: rewards.slice(0, limit).map((reward) => /* @__PURE__ */ jsxRuntime.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("td", { children: reward.type }),
        /* @__PURE__ */ jsxRuntime.jsxs("td", { children: [
          "$",
          reward.amount,
          " ",
          reward.currency
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("td", { className: `status-${reward.status}`, children: reward.status }),
        /* @__PURE__ */ jsxRuntime.jsx("td", { children: new Date(reward.created_at).toLocaleDateString() })
      ] }, reward.id)) })
    ] }),
    rewards.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "no-rewards", children: "No rewards earned yet. Start referring!" })
  ] });
}

exports.RewardHistory = RewardHistory;
