// Your account sid goes here
var accountSid = "AC595d7affd2fb2cdb37a528cb25e5d63f";

var appConfig = {
  pluginService: {
    enabled: true,
    url: '/plugins',
  },
  ytica: false, // Disable Ytica/Insights to avoid CORS issues
  logLevel: 'debug', // Set to debug for more detailed logs
  showSupervisorDesktopView: true,
  custom_data: {
    serverless_functions_protocol: 'https',
    serverless_functions_port: '',
    serverless_functions_domain: 'connie-profiles-v01-6987.twil.io',
    common: {},
    features: {},
  },
};
