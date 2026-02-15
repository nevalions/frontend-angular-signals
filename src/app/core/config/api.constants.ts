import { environment } from '../../../environments/environment';

let serverIP = environment.url;
let apiUrl = environment.apiUrl;
let serverPort = environment.port;
let serverProtocol = environment.protocol;
let wsProtocol = environment.wsProtocol;

const useRelativeUrls = !serverProtocol || !serverIP;

export let urlWithProtocolAndPort = useRelativeUrls
  ? ''
  : serverProtocol + '://' + serverIP + serverPort;
export let urlWithProtocol = useRelativeUrls
  ? ''
  : serverProtocol + '://' + apiUrl;

export const API_BASE_URL = urlWithProtocolAndPort;
export const WS_PROTOCOL = wsProtocol;
export const WS_BASE_URL = useRelativeUrls
  ? ''
  : `${wsProtocol}://${serverIP}${serverPort}`;

export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export function buildWsUrl(endpoint: string): string {
  if (useRelativeUrls) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    return `${protocol}://${host}${endpoint}`;
  }
  return `${WS_BASE_URL}${endpoint}`;
}

export function buildStaticUrl(staticPath: string): string {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const path = staticPath.replace(/^\/+/, '');
  return baseUrl ? `${baseUrl}/${path}` : `/${path}`;
}
