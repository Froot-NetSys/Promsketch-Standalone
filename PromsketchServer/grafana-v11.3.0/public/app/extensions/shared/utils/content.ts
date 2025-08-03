export const getContentType = (value: string | File) => {
  if (!value) {
    return 'url';
  }

  if (isFile(value)) {
    return 'file';
  }
  if (value.startsWith('http') || value.startsWith('data:')) {
    return 'url';
  }
  if (value.startsWith('#') || value.startsWith('rgb(') || value.startsWith('rgba(')) {
    return 'color';
  }

  return 'file';
};

export const isFile = (value: string | File): value is File => value instanceof File;
