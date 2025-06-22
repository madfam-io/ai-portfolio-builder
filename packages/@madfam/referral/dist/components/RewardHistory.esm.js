import { jsxs, jsx } from 'react/jsx-runtime';
import { useReferral } from '../hooks/useReferral.esm.js';

function RewardHistory({ userId, limit = 10, className = "" }) {
  const { rewards, totalEarnings, pendingRewards } = useReferral({ userId });
  return /* @__PURE__ */ jsxs("div", { className: `reward-history ${className}`, children: [
    /* @__PURE__ */ jsx("h3", { children: "Reward History" }),
    /* @__PURE__ */ jsxs("div", { className: "reward-summary", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { children: "Total Earned:" }),
        /* @__PURE__ */ jsxs("strong", { children: [
          "$",
          totalEarnings.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { children: "Pending:" }),
        /* @__PURE__ */ jsxs("strong", { children: [
          "$",
          pendingRewards.toFixed(2)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("table", { className: "rewards-table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Type" }),
        /* @__PURE__ */ jsx("th", { children: "Amount" }),
        /* @__PURE__ */ jsx("th", { children: "Status" }),
        /* @__PURE__ */ jsx("th", { children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rewards.slice(0, limit).map((reward) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: reward.type }),
        /* @__PURE__ */ jsxs("td", { children: [
          "$",
          reward.amount,
          " ",
          reward.currency
        ] }),
        /* @__PURE__ */ jsx("td", { className: `status-${reward.status}`, children: reward.status }),
        /* @__PURE__ */ jsx("td", { children: new Date(reward.created_at).toLocaleDateString() })
      ] }, reward.id)) })
    ] }),
    rewards.length === 0 && /* @__PURE__ */ jsx("p", { className: "no-rewards", children: "No rewards earned yet. Start referring!" })
  ] });
}

export { RewardHistory };
