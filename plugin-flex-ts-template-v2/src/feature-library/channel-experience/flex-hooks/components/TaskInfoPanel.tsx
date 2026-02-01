import * as Flex from '@twilio/flex-ui';
import React from 'react';

import FaxInfoPanel from '../../custom-components/FaxInfoPanel';
import WebformInfoPanel from '../../custom-components/WebformInfoPanel';
import { isFaxChannelEnabled, isWebformChannelEnabled } from '../../config';
import { FlexComponent } from '../../../../types/feature-loader/FlexComponent';

export const componentName = FlexComponent.TaskInfoPanel;
export const componentHook = function replaceFaxWebformInfoPanel(flex: typeof Flex, _manager: Flex.Manager) {
  if (isFaxChannelEnabled()) {
    (flex.TaskInfoPanel.Content as any).replace(
      <FaxInfoPanel key="fax-info-panel" />,
      {
        sortOrder: -1,
        if: (props: any) => {
          const { channelType, department, type, channel } = props.task?.attributes || {};
          return channelType === 'fax' || type === 'fax' || channel === 'fax' || (department || '').toLowerCase().startsWith('fax');
        },
      },
    );
  }

  if (isWebformChannelEnabled()) {
    (flex.TaskInfoPanel.Content as any).replace(
      <WebformInfoPanel key="webform-info-panel" />,
      {
        sortOrder: -1,
        if: (props: any) => {
          return props.task?.attributes?.department === 'Webform Submission';
        },
      },
    );
  }
};
