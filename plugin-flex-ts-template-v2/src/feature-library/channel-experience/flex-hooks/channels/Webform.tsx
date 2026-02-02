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
      const { department, type } = task.attributes as Record<string, string>;
      // Match webform tasks on chat channel (Tally/native forms)
      if (task.taskChannelUniqueName === 'chat' && department === 'Webform Submission') return true;
      // Match webform tasks on email channel (Adobe Sign forms)
      if (task.taskChannelUniqueName === 'email' && type === 'webform') return true;
      return false;
    },
    'FormIcon',
    'FormIcon',
    getWebformColor(),
  );

  const getFormName = (task: Flex.ITask): string => {
    const attrs = task.attributes as Record<string, string>;
    // Strip "Adobe Form: " prefix from customerName if present
    if (attrs.customerName?.startsWith('Adobe Form: ')) {
      return attrs.customerName.replace('Adobe Form: ', '');
    }
    return attrs.department || (manager.strings as any)[StringTemplates.WebformTaskName] || 'Webform';
  };

  const getTaskName = (task: Flex.ITask, queue: boolean): string => {
    const formName = getFormName(task);
    if (queue) {
      return `${task.queueName}: ${formName}`;
    }
    return formName;
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
          const attrs = task.attributes as Record<string, string>;
          // For email-based forms, customerAddress has the sender (often generic like adobesign@adobesign.com)
          const who = attrs.from || attrs.origin || attrs.customerAddress || '';
          // Don't show generic system emails as "From:"
          if (who && !who.includes('adobesign@')) return `From: ${who}`;
          return attrs.department || task.queueName || '';
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
