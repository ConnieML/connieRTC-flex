import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import React from 'react';

import { initFeatures } from './utils/feature-loader';
import ProfilePanel from './components/ProfilePanel';

const PLUGIN_NAME = 'FlexTSTemplatePlugin';

export default class FlexTSTemplatePlugin extends FlexPlugin {
  // eslint-disable-next-line no-restricted-syntax
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   * @param manager { Flex.Manager }
   */
  init(flex: typeof Flex, manager: Flex.Manager) {
    // Initialize features from feature-loader
    initFeatures(flex, manager);
    
    // Replace the CRM container with our custom profile panel
    flex.CRMContainer.defaultProps.uriCallback = () => '';  // Return empty string instead of null
    flex.CRMContainer.Content.replace(<ProfilePanel key="profile-panel" />);
  }
}