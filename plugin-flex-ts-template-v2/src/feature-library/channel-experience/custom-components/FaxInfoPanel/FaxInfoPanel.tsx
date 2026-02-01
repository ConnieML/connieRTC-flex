import { ITask, Template, templates } from '@twilio/flex-ui';
import React from 'react';
import { Box } from '@twilio-paste/core/box';
import { Heading } from '@twilio-paste/core/heading';
import { Text } from '@twilio-paste/core/text';
import { Flex } from '@twilio-paste/core/flex';
import { Anchor } from '@twilio-paste/core/anchor';

import { StringTemplates } from '../../flex-hooks/strings/ChannelExperience';

type FaxInfoPanelProps = {
  task: ITask;
};

export const FaxInfoPanel = ({ task }: FaxInfoPanelProps) => {
  const { department, from, customerName, channelType } = task.attributes as Record<string, string>;
  const senderInfo = from || customerName || 'Unknown';
  const departmentLabel = department || 'Fax';

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const receivedTime = formatDate(task.dateCreated);

  return (
    <Flex vertical>
      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h4" variant="heading40">
          <Template source={templates[StringTemplates.FaxInfoHeading]} />
        </Heading>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.FaxInfoDepartment]} />
        </Heading>
        <Text as="span">{departmentLabel}</Text>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.FaxInfoFrom]} />
        </Heading>
        <Text as="span">{senderInfo}</Text>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.FaxInfoReceived]} />
        </Heading>
        <Text as="span">{receivedTime}</Text>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.FaxInfoChannel]} />
        </Heading>
        <Text as="span">
          <Template source={templates[StringTemplates.FaxInfoChannelPath]} />
        </Text>
      </Box>
    </Flex>
  );
};
