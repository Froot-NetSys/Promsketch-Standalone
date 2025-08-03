interface BodyText {
  title: string;
  description: string;
}

export enum EMAIL_SHARING_MAGIC_LINK_ERRORS {
  NOT_FOUND_MAGIC_LINK = 'publicdashboards.magicLinkNotFound',
  EXPIRED_MAGIC_LINK = 'publicdashboards.magicLinkExpired',
}

export enum EMAIL_SHARING_ACCESS_ERRORS {
  INTERNAL_SERVER_ERROR = 'publicdashboards.internalServerError',
  INVALID_SESSION = 'publicdashboards.invalidSession',
  EXPIRED_SESSION = 'publicdashboards.sessionExpired',
}
export const DEFAULT_BODY_TEXT: BodyText = {
  title: 'Request access',
  description: "You'll receive an email with a one-time link.",
};

export const DEFAULT_ERROR_TITLE = 'Something went wrong';
export const ERROR_DESCRIPTION =
  "To request access to the dashboard again, enter your email. You'll receive an email with a one-time link.";

const EMAIL_SHARING_ERROR_TITLE_MAP: Record<string, string | undefined> = {
  [EMAIL_SHARING_ACCESS_ERRORS.INTERNAL_SERVER_ERROR]: DEFAULT_ERROR_TITLE,
  [EMAIL_SHARING_MAGIC_LINK_ERRORS.NOT_FOUND_MAGIC_LINK]: 'This link has expired or already been used',
  [EMAIL_SHARING_MAGIC_LINK_ERRORS.EXPIRED_MAGIC_LINK]: 'This magic link has expired',
  [EMAIL_SHARING_ACCESS_ERRORS.INVALID_SESSION]: 'You no longer have access',
  [EMAIL_SHARING_ACCESS_ERRORS.EXPIRED_SESSION]: 'Your access has expired',
};

export const getRequestAccessText = (errorQueryParam?: string): BodyText => {
  if (!errorQueryParam) {
    return DEFAULT_BODY_TEXT;
  }

  const errorTitle = EMAIL_SHARING_ERROR_TITLE_MAP[String(errorQueryParam)];
  return { title: errorTitle || DEFAULT_ERROR_TITLE, description: ERROR_DESCRIPTION };
};
