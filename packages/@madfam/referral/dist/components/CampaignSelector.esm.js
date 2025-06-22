import { jsx, jsxs } from 'react/jsx-runtime';
import { useReferralCampaigns } from '../hooks/useReferralCampaigns.esm.js';

function CampaignSelector({ userId, onSelect, className = "" }) {
  const { activeCampaigns, loading, error } = useReferralCampaigns({ userId });
  if (loading) return /* @__PURE__ */ jsx("div", { className, children: "Loading campaigns..." });
  if (error) return /* @__PURE__ */ jsx("div", { className, children: "Error loading campaigns" });
  return /* @__PURE__ */ jsxs("div", { className: `campaign-selector ${className}`, children: [
    /* @__PURE__ */ jsx("h3", { children: "Available Campaigns" }),
    /* @__PURE__ */ jsx("div", { className: "campaigns-grid", children: activeCampaigns.map((campaign) => /* @__PURE__ */ jsxs("div", { className: "campaign-card", children: [
      /* @__PURE__ */ jsx("h4", { children: campaign.name }),
      /* @__PURE__ */ jsx("p", { children: campaign.description }),
      /* @__PURE__ */ jsxs("div", { className: "rewards", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "You earn:" }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            campaign.referrer_reward.amount || campaign.referrer_reward.base_amount || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Friend gets:" }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            campaign.referee_reward.amount || campaign.referee_reward.base_amount || 0
          ] })
        ] })
      ] }),
      onSelect && /* @__PURE__ */ jsx("button", { onClick: () => onSelect(campaign.id), children: "Select Campaign" })
    ] }, campaign.id)) }),
    activeCampaigns.length === 0 && /* @__PURE__ */ jsx("p", { children: "No active campaigns available." })
  ] });
}

export { CampaignSelector };
