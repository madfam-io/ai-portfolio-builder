'use strict';

var jsxRuntime = require('react/jsx-runtime');
var useReferral = require('../hooks/useReferral.js');

const DEFAULT_PLATFORMS = [
  "twitter",
  "linkedin",
  "facebook",
  "whatsapp",
  "email",
  "copy_link"
];
function ShareHub({
  userId,
  platforms = DEFAULT_PLATFORMS,
  className = ""
}) {
  const { activeReferral, shareToSocial, sharing } = useReferral.useReferral({ userId });
  if (!activeReferral) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: "No active referral to share" });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `share-hub ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Share Your Referral" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "share-buttons", children: platforms.map((platform) => /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => shareToSocial(platform),
        disabled: sharing,
        className: `share-button share-${platform}`,
        children: [
          "Share on ",
          platform
        ]
      },
      platform
    )) })
  ] });
}

exports.ShareHub = ShareHub;
