export interface LicenseToken {
  status: number;
  jti: string;
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  nbf: number;
  lexp: number;
  lid: string;
  limit_by: string;
  included_users: number;
  prod: string[];
  company: string;
  usage_billing?: boolean;
  slug: string;
  details_url?: string;
  account?: string;
  trial?: boolean;
  trial_exp?: number;
  anonymousRatio?: number;
}

export interface ActiveUserStats {
  active_users: number;
  active_anonymous_devices: number;
}
