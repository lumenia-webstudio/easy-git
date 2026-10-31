// Appels relayés par le serveur local : github.com/login/* n'accepte pas les requêtes navigateur (CORS)
function postOAuth(step: 'device-code' | 'access-token', body: Record<string, string> = {}): Promise<Response> {
  return fetch(`/api/oauth/${step}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-EasyGit-Token': window.easyGit?.token ?? '',
    },
    body: JSON.stringify(body),
  });
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DeviceFlowResult {
  access_token: string;
  token_type: string;
  scope: string;
}

export type DeviceFlowError =
  | 'authorization_pending'
  | 'slow_down'
  | 'expired_token'
  | 'access_denied'
  | 'network_error';

const KNOWN_ERRORS: readonly DeviceFlowError[] = [
  'authorization_pending',
  'slow_down',
  'expired_token',
  'access_denied',
  'network_error',
];

function isDeviceFlowError(value: string): value is DeviceFlowError {
  return (KNOWN_ERRORS as readonly string[]).includes(value);
}

// Étape 1 : Demander un device_code et user_code à GitHub
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  try {
    const response = await postOAuth('device-code');

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json() as Promise<DeviceCodeResponse>;
  } catch (error) {
    throw new Error(
      `Device code request failed: ${error instanceof Error ? error.message : 'network_error'}`
    );
  }
}

// Étape 2 : Essayer d'obtenir l'access_token (à appeler en boucle)
export async function pollAccessToken(
  deviceCode: string,
): Promise<DeviceFlowResult | DeviceFlowError> {
  try {
    const response = await postOAuth('access-token', { device_code: deviceCode });

    if (!response.ok) {
      return 'network_error';
    }

    const data = await response.json() as Record<string, string>;

    if (data.error) {
      return isDeviceFlowError(data.error) ? data.error : 'network_error';
    }

    if (!data.access_token || !data.token_type) {
      return 'network_error';
    }
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope ?? '',
    } satisfies DeviceFlowResult;
  } catch {
    return 'network_error';
  }
}
