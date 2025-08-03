import { API_ROOT } from '../../reports/constants';

import { getContentType, isFile } from './content';

export const getResourceUrl = (resource: File | string) => {
  if (isFile(resource)) {
    return URL.createObjectURL(resource);
  }

  // Separate handling for the file names
  if (getContentType(resource) === 'file') {
    return `${API_ROOT}${resource}`;
  }

  return resource;
};

export const isValidUrl = (value: unknown) => {
  if (!value || value instanceof File) {
    return true;
  }
  return typeof value === 'string' && value.startsWith('http');
};
