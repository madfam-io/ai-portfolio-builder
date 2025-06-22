'use strict';

var jsxRuntime = require('react/jsx-runtime');
var useReferralCampaigns = require('../hooks/useReferralCampaigns.js');

function CampaignSelector({ userId, onSelect, className = "" }) {
  const { activeCampaigns, loading, error } = useReferralCampaigns.useReferralCampaigns({ userId });
  if (loading) return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "Loading campaigns..." });
  if (error) return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "Error loading campaigns" });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `campaign-selector ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Available Campaigns" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "campaigns-grid", children: activeCampaigns.map((campaign) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "campaign-card", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h4", { children: campaign.name }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: campaign.description }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rewards", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "You earn:" }),
          /* @__PURE__ */ jsxRuntime.jsxs("strong", { children: [
            "$",
            campaign.referrer_reward.amount || campaign.referrer_reward.base_amount || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Friend gets:" }),
          /* @__PURE__ */ jsxRuntime.jsxs("strong", { children: [
            "$",
            campaign.referee_reward.amount || campaign.referee_reward.base_amount || 0
          ] })
        ] })
      ] }),
      onSelect && /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => onSelect(campaign.id), children: "Select Campaign" })
    ] }, campaign.id)) }),
    activeCampaigns.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("p", { children: "No active campaigns available." })
  ] });
}

exports.CampaignSelector = CampaignSelector;
