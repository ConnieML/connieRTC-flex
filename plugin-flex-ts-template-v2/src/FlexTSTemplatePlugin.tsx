import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import { initFeatures } from './utils/feature-loader';

const PLUGIN_NAME = 'FlexTSTemplatePlugin';


export default class FlexTSTemplatePlugin extends FlexPlugin {
  public constructor() {
    super(PLUGIN_NAME);
  }

  init(flex: typeof Flex, manager: Flex.Manager) {
    // Initialize all features from the feature library
    initFeatures(flex, manager);
    
    // Log environment info
    console.log('Flex environment:', {
      accountSid: manager.serviceConfiguration.account_sid,
      flexServiceInstance: manager.serviceConfiguration.flex_service_instance_sid,
      workerSid: manager.workerClient?.sid,
      isLocalhost: window.location.hostname === 'localhost'
    });
  }
}
