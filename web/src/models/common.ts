// 定義 API 回傳的實際格式
export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: number;
}
