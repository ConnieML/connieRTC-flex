import * as Flex from '@twilio/flex-ui';

import { isCallTemplatesEnabled } from '../../config';

const getCallerName = (task: Flex.ITask): string => {
  const attrs = task.attributes as Record<string, string>;
  const firstName = attrs.first_name || attrs.firstname || '';
  const lastName = attrs.last_name || attrs.lastname || '';
  const callerName = attrs.caller_name || attrs.customerName || attrs.name || '';

  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ');
  if (callerName) return callerName;
  if (attrs.from) return `Caller: ${attrs.from}`;
  return (task as any).defaultFrom || 'Unknown Caller';
};

export const channelHook = function overrideCallTemplates(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isCallTemplatesEnabled()) return null;

  const CallChannel = flex.DefaultTaskChannels.Call;
  const templates = CallChannel.templates!;

  templates.TaskListItem = {
    ...templates.TaskListItem,
    firstLine: (task: Flex.ITask) => getCallerName(task),
    secondLine: (task: Flex.ITask) => {
      const direction = task.attributes.direction === 'outbound' ? 'Outbound' : 'Inbound';
      return direction;
    },
  };

  templates.TaskCanvasHeader = {
    ...templates.TaskCanvasHeader,
    title: (task: Flex.ITask) => getCallerName(task),
  };

  templates.IncomingTaskCanvas = {
    ...templates.IncomingTaskCanvas,
    firstLine: (task: Flex.ITask) => `${task.queueName}: ${getCallerName(task)}`,
  };

  // Return null — we mutated in place, no new channel to register
  return null;
};
