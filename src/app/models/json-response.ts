export interface JsonResponse {
  [x: string]: any;
  responseCode: number;
  result: any;
  success: boolean;
  mensagem: string;
  data: any;
}
