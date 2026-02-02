export default interface ChannelExperienceConfig {
  enabled: boolean;
  email_channel: {
    enabled: boolean;
    color: string;
  };
  fax_channel: {
    enabled: boolean;
    color: string;
  };
  webform_channel: {
    enabled: boolean;
    color: string;
  };
  messenger_channel: {
    enabled: boolean;
    color: string;
  };
  call_templates: {
    enabled: boolean;
  };
  chat_templates: {
    enabled: boolean;
  };
}
