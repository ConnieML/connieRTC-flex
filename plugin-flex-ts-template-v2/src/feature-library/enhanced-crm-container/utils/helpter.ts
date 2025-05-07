import { ITask } from '@twilio/flex-ui';

export const loadCRMContainerTabs = async (task?: ITask) => {
  // Return tab configuration
  // Use the profile_url from task attributes if available
  return [
    {
      label: 'CRM',
      url: task ? task.attributes.profile_url || '' : '',
    },
  ];
};