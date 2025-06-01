import { getFeatureFlags } from '../../utils/configuration';
import CustomProfileConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.custom_profile as CustomProfileConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
