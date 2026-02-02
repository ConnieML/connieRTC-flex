import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { ProductMessagingIcon } from '@twilio-paste/icons/esm/ProductMessagingIcon';

import { StringTemplates } from '../strings/ChannelExperience';
import { isMessengerChannelEnabled, getMessengerColor } from '../../config';

export const channelHook = function createMessengerChannel(flex: typeof Flex, manager: Flex.Manager) {
  if (!isMessengerChannelEnabled()) return null;

  const channelDefinition = flex.DefaultTaskChannels.createDefaultTaskChannel(
    'messenger',
    (task) => {
      const { channel, channelType } = task.attributes as Record<string, string>;
      return (
        task.taskChannelUniqueName === 'chat' &&
        (channel === 'messenger' || channelType === 'messenger')
      );
    },
    'MessagingIcon',
    'MessagingIcon',
    getMessengerColor(),
  );

  const getDisplayName = (task: Flex.ITask): string => {
    const attrs = task.attributes as Record<string, string>;
    // customerName is often "FB Messenger: Programs & Services" — strip the prefix
    if (attrs.customerName && attrs.customerName.startsWith('FB Messenger: ')) {
      return attrs.customerName.replace('FB Messenger: ', '');
    }
    return attrs.department || attrs.customerName || (manager.strings as any)[StringTemplates.MessengerTaskName] || 'FB Messenger';
  };

  const { templates } = channelDefinition;
  const MessengerChannel: Flex.TaskChannelDefinition = {
    ...channelDefinition,
    templates: {
      ...templates,
      TaskListItem: {
        ...templates?.TaskListItem,
        firstLine: (_task: Flex.ITask) => {
          return (manager.strings as any)[StringTemplates.MessengerTaskName] || 'FB Messenger';
        },
        secondLine: (task: Flex.ITask) => {
          const name = getDisplayName(task);
          return name ? `From: ${name}` : task.queueName || '';
        },
      },
      TaskCanvasHeader: {
        ...templates?.TaskCanvasHeader,
        title: (task: Flex.ITask) => {
          const name = getDisplayName(task);
          return `FB Messenger: ${name}`;
        },
      },
      IncomingTaskCanvas: {
        ...templates?.IncomingTaskCanvas,
        firstLine: (task: Flex.ITask) => {
          const name = getDisplayName(task);
          return `${task.queueName}: FB Messenger — ${name}`;
        },
      },
      TaskCard: {
        ...templates?.TaskCard,
        firstLine: (_task: Flex.ITask) => {
          return (manager.strings as any)[StringTemplates.MessengerTaskName] || 'FB Messenger';
        },
      },
      Supervisor: {
        ...templates?.Supervisor,
        TaskCanvasHeader: {
          ...templates?.Supervisor?.TaskCanvasHeader,
          title: (task: Flex.ITask) => {
            const name = getDisplayName(task);
            return `FB Messenger: ${name}`;
          },
        },
        TaskOverviewCanvas: {
          ...templates?.Supervisor?.TaskOverviewCanvas,
          firstLine: (task: Flex.ITask) => {
            const name = getDisplayName(task);
            return `${task.queueName}: FB Messenger — ${name}`;
          },
        },
      },
    },
    icons: {
      active: <ProductMessagingIcon element="CHANNEL_EXP_ICON" decorative={true} key="active-messenger-icon" />,
      list: <ProductMessagingIcon element="CHANNEL_EXP_ICON" decorative={true} key="list-messenger-icon" />,
      main: <ProductMessagingIcon element="CHANNEL_EXP_ICON" decorative={true} key="main-messenger-icon" />,
    },
  };

  return MessengerChannel;
};
