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
      const attrs = task.attributes as Record<string, string>;
      const { channel, channelSource, department } = attrs;

      // Messenger tasks
      if (channelSource === 'messenger' || (department || '').toLowerCase().includes('messenger')) {
        const messengerPrefix = (manager.strings as any)[StringTemplates.MessengerPrefix] || 'FB Messenger';
        return messengerPrefix;
      }

      // Map channel attribute to display label
      if (channel === 'webchat' || channel === 'web') return 'Live Webchat';
      if (channel === 'email') return 'Email';
      if (channel) return channel.charAt(0).toUpperCase() + channel.slice(1);

      return task.queueName || 'Chat';
    },
    secondLine: (task: Flex.ITask) => {
      const attrs = task.attributes as Record<string, string>;
      const { customerName, from, origin, department } = attrs;

      if (customerName) return `From: ${customerName}`;
      if (from) return `From: ${from}`;
      if (origin) return `From: ${origin}`;
      if (department) return `From: ${department}`;
      return task.queueName || '';
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
