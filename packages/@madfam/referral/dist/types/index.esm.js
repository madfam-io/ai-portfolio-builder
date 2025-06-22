class ReferralValidationError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "ReferralValidationError";
  }
}
class FraudDetectionError extends Error {
  constructor(message, riskScore, flags) {
    super(message);
    this.riskScore = riskScore;
    this.flags = flags;
    this.name = "FraudDetectionError";
  }
}
function isValidReferralStatus(status) {
  return ["pending", "converted", "expired", "fraudulent"].includes(status);
}
function isValidRewardType(type) {
  return [
    "cash",
    "credit",
    "discount",
    "subscription_credit",
    "feature_unlock"
  ].includes(type);
}
function isValidCampaignType(type) {
  return [
    "double_sided",
    "milestone",
    "tiered",
    "seasonal",
    "product_specific"
  ].includes(type);
}

export { FraudDetectionError, ReferralValidationError, isValidCampaignType, isValidReferralStatus, isValidRewardType };
