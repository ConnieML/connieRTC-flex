import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { FaxCapableIcon } from '@twilio-paste/icons/esm/FaxCapableIcon';

import { StringTemplates } from '../strings/ChannelExperience';
import { isFaxChannelEnabled, getFaxColor } from '../../config';

export const channelHook = function createFaxChannel(flex: typeof Flex, manager: Flex.Manager) {
  if (!isFaxChannelEnabled()) return null;

  const channelDefinition = flex.DefaultTaskChannels.createDefaultTaskChannel(
    'fax',
    (task) => {
      const { channelType, department, type, channel } = task.attributes as Record<string, string>;
      return (
        ['chat', 'email', 'fax'].includes(task.taskChannelUniqueName) &&
        (channelType === 'fax' || type === 'fax' || channel === 'fax' || (department || '').toLowerCase().startsWith('fax'))
      );
    },
    'FaxIcon',
    'FaxIcon',
    getFaxColor(),
  );

  const getTaskName = (task: Flex.ITask, queue: boolean): string => {
    const department = task.attributes.department || (manager.strings as any)[StringTemplates.FaxTaskName];
    if (queue) {
      return `${task.queueName}: ${department}`;
    }
    return department;
  };

  const { templates } = channelDefinition;
  const FaxChannel: Flex.TaskChannelDefinition = {
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
      active: <FaxCapableIcon element="CHANNEL_EXP_ICON" decorative={true} key="active-fax-icon" />,
      list: <FaxCapableIcon element="CHANNEL_EXP_ICON" decorative={true} key="list-fax-icon" />,
      main: <FaxCapableIcon element="CHANNEL_EXP_ICON" decorative={true} key="main-fax-icon" />,
    },
  };

  return FaxChannel;
};
