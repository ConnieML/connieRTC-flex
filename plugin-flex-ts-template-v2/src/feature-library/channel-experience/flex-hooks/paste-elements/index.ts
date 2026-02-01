import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  CHANNEL_EXP_ICON: {
    width: '100%',
    height: '100%',
    minWidth: 'sizeSquare90',
    padding: 'space20',
  },
  CHANNEL_EXP_CONTENT_BOX: {
    paddingBottom: 'space40',
  },
  CHANNEL_EXP_CONTENT_HEADING: {
    marginBottom: 'space0',
  },
  CHANNEL_EXP_BUTTON_BOX: {
    paddingLeft: 'space40',
    paddingRight: 'space40',
    paddingTop: 'space40',
  },
} as { [key: string]: PasteCustomCSS };
