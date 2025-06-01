import React from 'react';
import { Box, Stack, Text, Avatar } from '@twilio-paste/core';
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { Manager, templates } from '@twilio/flex-ui';

const CustomProfile: React.FC = () => {
  const manager = Manager.getInstance();
  const fullName = manager.user?.identity || 'Agent';
  const userEmail = ''; // You might need to get this from somewhere else
  const userRoles = manager.user?.roles || [];
  
  return (
    <Box padding="space40">
      <Stack orientation="horizontal" spacing="space40">
        <Avatar size="sizeIcon80" name={fullName} icon={UserIcon} />
        <Stack orientation="vertical" spacing="space20">
          <Text as="h3" fontSize="fontSize30" fontWeight="fontWeightBold">
            {fullName}
          </Text>
          <Text as="p" fontSize="fontSize20" color="colorTextWeak">
            {userEmail}
          </Text>
          <Text as="p" fontSize="fontSize20" color="colorTextWeak">
            {userRoles.join(', ')}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CustomProfile;