import { getFeatureFlags } from '../../utils/configuration';
import ChannelExperienceConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  email_channel = { enabled: true, color: '#2563EB' },
  fax_channel = { enabled: true, color: '#D97706' },
  webform_channel = { enabled: true, color: '#7C3AED' },
  messenger_channel = { enabled: true, color: '#0084FF' },
  call_templates = { enabled: true },
  chat_templates = { enabled: true },
} = (getFeatureFlags()?.features?.channel_experience as ChannelExperienceConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const isEmailChannelEnabled = () => {
  return enabled && email_channel.enabled;
};

export const getEmailColor = () => {
  return email_channel.color;
};

export const isFaxChannelEnabled = () => {
  return enabled && fax_channel.enabled;
};

export const getFaxColor = () => {
  return fax_channel.color;
};

export const isWebformChannelEnabled = () => {
  return enabled && webform_channel.enabled;
};

export const getWebformColor = () => {
  return webform_channel.color;
};

export const isMessengerChannelEnabled = () => {
  return enabled && messenger_channel.enabled;
};

export const getMessengerColor = () => {
  return messenger_channel.color;
};

export const isCallTemplatesEnabled = () => {
  return enabled && call_templates.enabled;
};

export const isChatTemplatesEnabled = () => {
  return enabled && chat_templates.enabled;
};
