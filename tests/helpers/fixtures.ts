import { createSubmissionId } from '../../src/shared/inquiry.ts';

/** The JSON shapes returned by the /api endpoints. */
export interface ApiBody {
  id?: string;
  token?: string;
  error?: string;
  errors?: Record<string, string>;
}

export async function readJson(response: Response): Promise<ApiBody> {
  return (await response.json()) as ApiBody;
}

/** A complete, valid contact form submission with a fresh submission id. */
export const validInquiry = () => ({
  fullName: 'Test Visitor',
  company: 'Example Company',
  phone: '+1 (202) 555-0123',
  email: 'visitor@example.com',
  services: ['booking'],
  context: 'Two locations',
  brief: 'A booking system for our sample business.',
  timeline: 'soon',
  language: 'en',
  submissionId: createSubmissionId(),
});
