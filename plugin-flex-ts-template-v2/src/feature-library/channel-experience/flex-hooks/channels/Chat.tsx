import * as Flex from '@twilio/flex-ui';

import { isChatTemplatesEnabled } from '../../config';
import { StringTemplates } from '../strings/ChannelExperience';

export const channelHook = function overrideChatTemplates(flex: typeof Flex, manager: Flex.Manager) {
  if (!isChatTemplatesEnabled()) return null;

  const ChatChannel = flex.DefaultTaskChannels.Chat;
  const templates = ChatChannel.templates!;

  templates.TaskListItem = {
    ...templates.TaskListItem,
    firstLine: (task: Flex.ITask) => {
      const { department } = task.attributes as Record<string, string>;
      if (department) {
        return `${task.queueName}: ${department}`;
      }
      return `${task.queueName}: ${task.attributes.customerName || task.attributes.from || 'Chat'}`;
    },
    secondLine: (task: Flex.ITask) => {
      const { channelSource, department, customerName } = task.attributes as Record<string, string>;
      // Messenger tasks get a distinct prefix
      if (channelSource === 'messenger' || (department || '').toLowerCase().includes('messenger')) {
        const messengerPrefix = (manager.strings as any)[StringTemplates.MessengerPrefix] || 'FB Messenger';
        return `${messengerPrefix} - ${department || ''}`;
      }
      return customerName || '';
    },
  };

  templates.TaskCanvasHeader = {
    ...templates.TaskCanvasHeader,
    title: (task: Flex.ITask) => {
      const { department } = task.attributes as Record<string, string>;
      if (department) {
        return `${task.queueName}: ${department}`;
      }
      return `${task.queueName}: ${task.attributes.customerName || task.attributes.from || 'Chat'}`;
    },
  };

  templates.IncomingTaskCanvas = {
    ...templates.IncomingTaskCanvas,
    firstLine: (task: Flex.ITask) => {
      const { department } = task.attributes as Record<string, string>;
      if (department) {
        return `${task.queueName}: ${department}`;
      }
      return `${task.queueName}: ${task.attributes.customerName || task.attributes.from || 'Chat'}`;
    },
  };

  // Return null — we mutated in place, no new channel to register
  return null;
};
