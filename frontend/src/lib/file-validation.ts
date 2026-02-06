const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string[]> = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_TYPES.document,
  ...ALLOWED_TYPES.image,
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the maximum allowed size of 10MB`,
    };
  }

  // Check file type
  if (!ALL_ALLOWED_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
      return {
        valid: false,
        error: `File type "${file.type || ext}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

export function validateFiles(files: File[]): FileValidationResult {
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
