let protocol = 'http';
let apiUrl = 'localhost:9000';

export const environment = {
  production: false,
  currentYear: new Date().getFullYear(),
  currentSeasonId: 3,
  url: 'localhost',
  port: ':9000',
  angular_port: ':4200',
  protocol: protocol,
  wsProtocol: 'ws',
  apiUrl: apiUrl,
  backendUrl: protocol + '://' + apiUrl,
  timeFormat: '24h',
};
