const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL. Configúrala en mobile/.env.',
  );
}

type ValidationErrors = Record<string, string>;

type ApiErrorResponse = {
  message?: string;
  validationErrors?: ValidationErrors;
};

export class ApiError extends Error {
  readonly status: number;
  readonly validationErrors: ValidationErrors;

  constructor(
    message: string,
    status: number,
    validationErrors: ValidationErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
  });

  const responseText = await response.text();

  let responseBody: unknown = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const errorBody =
      typeof responseBody === 'object' && responseBody !== null
        ? (responseBody as ApiErrorResponse)
        : null;

    throw new ApiError(
      errorBody?.message ?? `Error HTTP ${response.status}`,
      response.status,
      errorBody?.validationErrors ?? {},
    );
  }

  return responseBody as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstValidationError = Object.values(
      error.validationErrors,
    )[0];

    return firstValidationError ?? error.message;
  }

  if (error instanceof TypeError) {
    return 'No se ha podido conectar con el servidor.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado.';
}