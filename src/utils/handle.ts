export function handleResponse(
  success: boolean,
  data: any,
  message: string,
  status: number,
  to?: any
) {
  return {
    success,
    data,
    message,
    status,
  };
}
