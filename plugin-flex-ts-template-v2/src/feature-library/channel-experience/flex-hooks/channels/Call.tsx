import * as Flex from '@twilio/flex-ui';

import { isCallTemplatesEnabled } from '../../config';

export const channelHook = function overrideCallTemplates(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isCallTemplatesEnabled()) return null;

  const CallChannel = flex.DefaultTaskChannels.Call;
  const templates = CallChannel.templates!;

  templates.TaskListItem = {
    ...templates.TaskListItem,
    firstLine: (task: Flex.ITask) => {
      const name = task.attributes.name || task.attributes.customerName || task.attributes.from || '';
      return `${task.queueName}: ${name}`;
    },
    secondLine: (task: Flex.ITask) => {
      const direction = task.attributes.direction === 'outbound' ? 'Outbound' : 'Inbound';
      return direction;
    },
  };

  templates.TaskCanvasHeader = {
    ...templates.TaskCanvasHeader,
    title: (task: Flex.ITask) => {
      const name = task.attributes.name || task.attributes.customerName || task.attributes.from || '';
      return `${task.queueName}: ${name}`;
    },
  };

  templates.IncomingTaskCanvas = {
    ...templates.IncomingTaskCanvas,
    firstLine: (task: Flex.ITask) => {
      const name = task.attributes.name || task.attributes.customerName || task.attributes.from || '';
      return `${task.queueName}: ${name}`;
    },
  };

  // Return null — we mutated in place, no new channel to register
  return null;
};
