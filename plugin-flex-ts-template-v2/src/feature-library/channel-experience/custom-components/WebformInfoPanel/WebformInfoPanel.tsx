import { ITask, Template, templates } from '@twilio/flex-ui';
import React from 'react';
import { Box } from '@twilio-paste/core/box';
import { Heading } from '@twilio-paste/core/heading';
import { Text } from '@twilio-paste/core/text';
import { Flex } from '@twilio-paste/core/flex';

import { StringTemplates } from '../../flex-hooks/strings/ChannelExperience';

type WebformInfoPanelProps = {
  task: ITask;
};

export const WebformInfoPanel = ({ task }: WebformInfoPanelProps) => {
  const { department, customerName } = task.attributes as Record<string, string>;
  const formType = department || 'Webform Submission';
  const submittedBy = customerName || 'Unknown';

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
          <Template source={templates[StringTemplates.WebformInfoHeading]} />
        </Heading>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.WebformInfoType]} />
        </Heading>
        <Text as="span">{formType}</Text>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.WebformInfoSubmittedBy]} />
        </Heading>
        <Text as="span">{submittedBy}</Text>
      </Box>

      <Box element="CHANNEL_EXP_CONTENT_BOX">
        <Heading element="CHANNEL_EXP_CONTENT_HEADING" as="h5" variant="heading50">
          <Template source={templates[StringTemplates.WebformInfoReceived]} />
        </Heading>
        <Text as="span">{receivedTime}</Text>
      </Box>
    </Flex>
  );
};
