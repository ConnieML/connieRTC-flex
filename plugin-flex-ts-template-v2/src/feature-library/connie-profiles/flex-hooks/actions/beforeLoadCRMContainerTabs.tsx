import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { FlexActionEvent } from '../../../../types/feature-loader';
import ProfilePanel from '../../custom-components/ProfilePanel';

export const actionEvent = FlexActionEvent.before;
export const actionName = 'LoadCRMContainerTabs';
export const actionHook = function addConnieProfilesTabToEnhancedCRM(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    console.log('Connie Profiles: Adding tab to CRM container', payload);
    
    // Add the Connie Profiles tab to the enhanced CRM container
    payload.components = [
      ...payload.components,
      {
        title: 'Customer Profile',
        order: 1, // Make it the first tab
        component: <ProfilePanel key="connie-profiles-panel" />,
      },
    ];
  });
};