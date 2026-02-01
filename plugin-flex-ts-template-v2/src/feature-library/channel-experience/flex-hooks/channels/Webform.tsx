import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { DocumentationIcon } from '@twilio-paste/icons/esm/DocumentationIcon';

import { StringTemplates } from '../strings/ChannelExperience';
import { isWebformChannelEnabled, getWebformColor } from '../../config';

export const channelHook = function createWebformChannel(flex: typeof Flex, manager: Flex.Manager) {
  if (!isWebformChannelEnabled()) return null;

  const channelDefinition = flex.DefaultTaskChannels.createDefaultTaskChannel(
    'webform',
    (task) => {
      const { department } = task.attributes as Record<string, string>;
      return task.taskChannelUniqueName === 'chat' && department === 'Webform Submission';
    },
    'FormIcon',
    'FormIcon',
    getWebformColor(),
  );

  const getTaskName = (task: Flex.ITask, queue: boolean): string => {
    const department = task.attributes.department || (manager.strings as any)[StringTemplates.WebformTaskName];
    if (queue) {
      return `${task.queueName}: ${department}`;
    }
    return department;
  };

  const { templates } = channelDefinition;
  const WebformChannel: Flex.TaskChannelDefinition = {
    ...channelDefinition,
    templates: {
      ...templates,
      TaskListItem: {
        ...templates?.TaskListItem,
        firstLine: (task: Flex.ITask) => getTaskName(task, true),
        secondLine: (task: Flex.ITask) => {
          return task.attributes.customerName || '';
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
      active: <DocumentationIcon element="CHANNEL_EXP_ICON" decorative={true} key="active-webform-icon" />,
      list: <DocumentationIcon element="CHANNEL_EXP_ICON" decorative={true} key="list-webform-icon" />,
      main: <DocumentationIcon element="CHANNEL_EXP_ICON" decorative={true} key="main-webform-icon" />,
    },
  };

  return WebformChannel;
};
