import { getFeatureFlags } from '../../utils/configuration';
import { CustomProfilePanelConfig } from './types/ServiceConfiguration';

const { enabled = false, profile_proxy_url = 'https://connie-profiles-v01-6987.twil.io/profile-proxy' } = 
  (getFeatureFlags()?.features?.custom_profile_panel as CustomProfilePanelConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getProfileProxyUrl = () => {
  return profile_proxy_url;
};