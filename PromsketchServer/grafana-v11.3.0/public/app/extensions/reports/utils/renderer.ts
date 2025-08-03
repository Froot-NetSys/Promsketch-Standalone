// Get renderer version from its config field, return 1 by default
import { config } from '@grafana/runtime';

export const getRendererMajorVersion = (): number | null => {
  const version = config.rendererVersion;
  if (version === '') {
    return null;
  }

  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  const res = semverRegex.exec(version);

  let majorVersionStr = '';
  if (res && res.length > 1) {
    majorVersionStr = res[1];
  }

  if (majorVersionStr === '') {
    return 1;
  }

  let majorVersion = parseInt(majorVersionStr, 10);
  if (isNaN(majorVersion)) {
    majorVersion = 1;
  }

  return majorVersion;
};
