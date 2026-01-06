import { environment } from '../../../environments/environment';

let serverIP = environment.url;
let apiUrl = environment.apiUrl;
let serverPort = environment.port;
let serverProtocol = environment.protocol;
let wsProtocol = environment.wsProtocol

export let urlWithProtocolAndPort =
  serverProtocol + '://' + serverIP + serverPort;
export let urlWithProtocol = serverProtocol + '://' + apiUrl;

export const API_BASE_URL = urlWithProtocolAndPort;
export const WS_PROTOCOL = wsProtocol;
export const WS_BASE_URL = `${wsProtocol}://${serverIP}${serverPort}/ws`;

export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export function buildWsUrl(endpoint: string): string {
  return `${WS_BASE_URL}${endpoint}`;
}

export function buildStaticUrl(staticPath: string): string {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const path = staticPath.replace(/^\/+/, '');
  return `${baseUrl}/${path}`;
}
