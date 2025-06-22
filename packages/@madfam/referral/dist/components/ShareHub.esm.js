import { jsx, jsxs } from 'react/jsx-runtime';
import { useReferral } from '../hooks/useReferral.esm.js';

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
  const { activeReferral, shareToSocial, sharing } = useReferral({ userId });
  if (!activeReferral) {
    return /* @__PURE__ */ jsx("div", { className, children: "No active referral to share" });
  }
  return /* @__PURE__ */ jsxs("div", { className: `share-hub ${className}`, children: [
    /* @__PURE__ */ jsx("h3", { children: "Share Your Referral" }),
    /* @__PURE__ */ jsx("div", { className: "share-buttons", children: platforms.map((platform) => /* @__PURE__ */ jsxs(
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

export { ShareHub };
