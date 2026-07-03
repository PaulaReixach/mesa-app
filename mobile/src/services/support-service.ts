import { apiRequest } from '../lib/api';
import {
  CreateSupportRequestPayload,
  SupportRequestResponse,
} from '../types/support';

export function createSupportRequest(
  payload: CreateSupportRequestPayload,
  accessToken: string,
): Promise<SupportRequestResponse> {
  return apiRequest<SupportRequestResponse>(
    '/support/requests',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}