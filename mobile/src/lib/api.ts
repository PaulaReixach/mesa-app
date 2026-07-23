import { fetch as expoFetch } from 'expo/fetch';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL. Configúrala en mobile/.env.',
  );
}

const NORMALIZED_API_URL =
  API_URL.replace(/\/+$/, '');

type ValidationErrors =
  Record<string, string>;

type ApiErrorResponse = {
  message?: string;
  detail?: string;
  validationErrors?: ValidationErrors;
};

export class ApiError extends Error {
  readonly status: number;

  readonly validationErrors:
    ValidationErrors;

  constructor(
    message: string,
    status: number,
    validationErrors:
      ValidationErrors = {},
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.validationErrors =
      validationErrors;
  }
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const responseText =
    await response.text();

  let responseBody: unknown = null;

  if (responseText) {
    try {
      responseBody =
        JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const errorBody =
      typeof responseBody === 'object'
      && responseBody !== null
        ? responseBody as ApiErrorResponse
        : null;

    throw new ApiError(
      errorBody?.message
        ?? errorBody?.detail
        ?? `Error HTTP ${response.status}`,
      response.status,
      errorBody?.validationErrors ?? {},
    );
  }

  return responseBody as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(
    resolveApiUrl(path),
    {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
        ...(accessToken
          ? {
              Authorization:
                `Bearer ${accessToken}`,
            }
          : {}),
      },
    },
  );

  return parseResponse<T>(response);
}

export async function apiMultipartRequest<T>(
  path: string,
  formData: FormData,
  accessToken: string,
  method:
    'POST' | 'PUT' | 'PATCH' = 'POST',
): Promise<T> {
  const response = await expoFetch(
    resolveApiUrl(path),
    {
      method,
      headers: {
        Accept: 'application/json',
        Authorization:
          `Bearer ${accessToken}`,
      },
      body: formData,
    },
  );

  return parseResponse<T>(
    response as Response,
  );
}

export function resolveApiUrl(
  pathOrUrl: string,
): string {
  if (
    pathOrUrl.startsWith('http://')
    || pathOrUrl.startsWith('https://')
    || pathOrUrl.startsWith('file://')
    || pathOrUrl.startsWith('content://')
    || pathOrUrl.startsWith('data:')
    || pathOrUrl.startsWith('blob:')
  ) {
    return pathOrUrl;
  }

  const normalizedPath =
    pathOrUrl.startsWith('/')
      ? pathOrUrl
      : `/${pathOrUrl}`;

  return `${NORMALIZED_API_URL}${normalizedPath}`;
}

export function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    const firstValidationError =
      Object.values(
        error.validationErrors,
      )[0];

    return firstValidationError
      ?? error.message;
  }

  if (error instanceof TypeError) {
    return 'No se ha podido conectar con el servidor.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado.';
}
