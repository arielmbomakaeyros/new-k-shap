import axiosClient from '../lib/axios';

export async function uploadMultipart<T>(
  url: string,
  file: File,
  fieldName = 'file',
  extra?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => formData.append(key, value));
  }

  const response = await axiosClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
