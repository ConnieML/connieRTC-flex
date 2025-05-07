import { FlexPlugin } from '@twilio/flex-plugin';
import { Actions } from '@twilio/flex-ui';

import { Configuration } from './types/enhanced-crm-container';
import { loadCRMContainerTabs } from './utils/helper';

const PLUGIN_NAME = 'EnhancedCRMContainerPlugin';

export default class EnhancedCRMContainerPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex: typeof import('@twilio/flex-ui'), manager: import('@twilio/flex-ui').Manager): Promise<void> {
    this.registerReducers(manager);

    const options: Configuration = { sortOrder: 0, enabled: true };

    if (!options.enabled) {
      return;
    }

    // Enable tabs in the CRM container
    flex.CRMContainer.defaultProps.showTabs = true;

    // Add your uriCallback for dynamic URL
    flex.CRMContainer.defaultProps.uriCallback = (task) => {
      const profileUrl = task?.attributes?.profile_url || 'https://v1.connie.plus';
      console.log(`Loading CRM URL: ${profileUrl}`);
      return profileUrl;
    };

    // Restore event listeners for task events
    flex.Actions.addListener('beforeAcceptTask', async (payload) => {
      if (payload.task.taskChannelUniqueName === 'voice') {
        await loadCRMContainerTabs(payload.task);
      }
    });

    flex.Actions.addListener('beforeSelectTask', async (payload) => {
      if (!payload.task) {
        return;
      }
      await loadCRMContainerTabs(payload.task);
    });

    // Load initial tabs
    const initialTabs = await loadCRMContainerTabs();
    manager.store.dispatch({ type: 'LOAD_CRM_CONTAINER_TABS', payload: initialTabs });
  }

  private registerReducers(manager: import('@twilio/flex-ui').Manager) {
    if (!manager.store.addReducer) {
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${manager.store.version}`);
      return;
    }
    // manager.store.addReducer(namespace, reducers);
  }
}