import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { ProductEmailAPIIcon } from '@twilio-paste/icons/esm/ProductEmailAPIIcon';

import { StringTemplates } from '../strings/ChannelExperience';
import { isEmailChannelEnabled, getEmailColor } from '../../config';

export const channelHook = function createEmailChannel(flex: typeof Flex, manager: Flex.Manager) {
  if (!isEmailChannelEnabled()) return null;

  const channelDefinition = flex.DefaultTaskChannels.createDefaultTaskChannel(
    'email',
    (task) => {
      const { channelType, department, type, channel } = task.attributes as Record<string, string>;

      // Only match email task channel
      if (task.taskChannelUniqueName !== 'email') return false;

      // Exclude fax tasks (they also arrive on email channel)
      if (
        channelType === 'fax' ||
        type === 'fax' ||
        channel === 'fax' ||
        (department || '').toLowerCase().startsWith('fax')
      )
        return false;

      // Everything else on the email channel is an email task
      return true;
    },
    'EmailIcon',
    'EmailIcon',
    getEmailColor(),
  );

  const getTaskName = (task: Flex.ITask, queue: boolean): string => {
    const department = task.attributes.department || (manager.strings as any)[StringTemplates.EmailTaskName];
    if (queue) {
      return `${task.queueName}: ${department}`;
    }
    return department;
  };

  const { templates } = channelDefinition;
  const EmailChannel: Flex.TaskChannelDefinition = {
    ...channelDefinition,
    templates: {
      ...templates,
      TaskListItem: {
        ...templates?.TaskListItem,
        firstLine: (task: Flex.ITask) => getTaskName(task, true),
        secondLine: (task: Flex.ITask) => {
          const from = task.attributes.from || task.attributes.customerName || '';
          return from;
        },
      },
      TaskCanvasHeader: {
        ...templates?.TaskCanvasHeader,
        title: (task: Flex.ITask) => getTaskName(task, true),
      },
      IncomingTaskCanvas: {
        ...templates?.IncomingTaskCanvas,
        firstLine: (task: Flex.ITask) => getTaskName(task, true),
      },
      TaskCard: {
        ...templates?.TaskCard,
        firstLine: (task: Flex.ITask) => getTaskName(task, false),
      },
      Supervisor: {
        ...templates?.Supervisor,
        TaskCanvasHeader: {
          ...templates?.Supervisor?.TaskCanvasHeader,
          title: (task: Flex.ITask) => getTaskName(task, false),
        },
        TaskOverviewCanvas: {
          ...templates?.Supervisor?.TaskOverviewCanvas,
          firstLine: (task: Flex.ITask) => getTaskName(task, true),
        },
      },
    },
    icons: {
      active: <ProductEmailAPIIcon element="CHANNEL_EXP_ICON" decorative={true} key="active-email-icon" />,
      list: <ProductEmailAPIIcon element="CHANNEL_EXP_ICON" decorative={true} key="list-email-icon" />,
      main: <ProductEmailAPIIcon element="CHANNEL_EXP_ICON" decorative={true} key="main-email-icon" />,
    },
  };

  return EmailChannel;
};
