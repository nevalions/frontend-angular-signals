// let protocol = 'https';
// let apiUrl = 'statsboard.ru';

let protocol = 'https';
let apiUrl = 'statsboard.ru';

export const environment = {
  production: true,
  currentYear: new Date().getFullYear(),
  currentSeasonId: 3,
  url: apiUrl,
  port: '',
  angular_port: '',
  protocol: protocol,
  wsProtocol: 'wss',
  apiUrl: apiUrl,
  backendUrl: protocol + '://' + apiUrl,
};
