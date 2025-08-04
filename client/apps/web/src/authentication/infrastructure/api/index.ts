export type { RegistrationData } from "../../application";
// Re-export domain types for convenience
export type { Account } from "../../domain/models";
export { AccountApi } from "./AccountApi";
export { AuthenticationApi } from "./AuthenticationApi";
export { ProfileApi, type ProfileInfo } from "./ProfileApi";

// Re-export utilities for external use if needed
export { logApiError } from "./utils/errorLogger";
export { mapAuthenticationError, mapSessionError } from "./utils/errorMapper";
