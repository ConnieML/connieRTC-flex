import * as Flex from '@twilio/flex-ui';

import CustomProfile from '../../custom-components/CustomProfile';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.WorkerProfile;
export const componentHook = function replaceWorkerProfile(flex: typeof Flex, _manager: Flex.Manager) {
  flex.WorkerProfile.Content.remove('info');
  flex.WorkerProfile.Content.add(
    <CustomProfile key="custom-profile" />,
    {
      sortOrder: 1,
    }
  );
};