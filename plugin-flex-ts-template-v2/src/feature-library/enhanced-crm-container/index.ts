import { FlexPlugin } from '@twilio/flex-plugin';

const PLUGIN_NAME = 'EnhancedCRMContainerPlugin';

export default class EnhancedCRMContainerPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex: typeof import('@twilio/flex-ui'), manager: import('@twilio/flex-ui').Manager) {
    flex.CRMContainer.defaultProps.uriCallback = (task: import('@twilio/flex-ui').ITask) => {
      const profileUrl: string = task?.attributes?.profile_url || 'https://v1.connie.plus'; // Fallback to default
      console.log(`Loading CRM URL: ${profileUrl}`); // Debug log
      return profileUrl;
    };
  }
}
