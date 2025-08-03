import { LinkButton } from '@grafana/ui';

export interface Props {
  orgSlug?: string;
  licenseId?: string;
}

export const CustomerSupportButton = ({ orgSlug, licenseId }: Props) => {
  let href = 'https://grafana.com/contact';
  if (orgSlug && licenseId) {
    href = `https://grafana.com/orgs/${orgSlug}/tickets?support=licensing&licenseId=${licenseId}`;
  }
  return (
    <LinkButton href={href} target="_blank" rel="noopener noreferrer">
      Contact customer support
    </LinkButton>
  );
};
