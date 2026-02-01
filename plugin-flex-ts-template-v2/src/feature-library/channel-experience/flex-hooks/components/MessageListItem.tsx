import * as Flex from '@twilio/flex-ui';
import React, { useState, useEffect } from 'react';

import { FlexComponent } from '../../../../types/feature-loader/FlexComponent';
import { isFaxChannelEnabled } from '../../config';

const FaxPdfRenderer = ({ message }: any) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try known media paths: source.media (Flex 2.x), attachedMedia, media
    const media = message?.source?.media || message?.source?.attachedMedia || message?.media;
    if (!media || media.length === 0) return;

    const pdfMedia = Array.from(media).find(
      (m: any) => m?.contentType === 'application/pdf' || m?.filename?.endsWith('.pdf'),
    ) || media[0];

    if (!pdfMedia) return;

    if (typeof pdfMedia.getContentTemporaryUrl === 'function') {
      pdfMedia.getContentTemporaryUrl().then((url: string) => {
        console.log('[FaxPdfRenderer] PDF URL obtained');
        setPdfUrl(url);
      });
    } else if (typeof pdfMedia.url === 'string') {
      setPdfUrl(pdfMedia.url);
    }
  }, [message]);

  if (!pdfUrl) return null;

  return (
    <div style={{ width: '100%', marginTop: 8 }}>
      <iframe
        src={pdfUrl}
        title="Fax PDF"
        style={{
          width: '100%',
          height: 500,
          border: '1px solid #e1e3ea',
          borderRadius: 4,
        }}
      />
    </div>
  );
};

export const componentName = FlexComponent.MessageListItem;
export const componentHook = function addFaxPdfViewer(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isFaxChannelEnabled()) return;

  flex.MessageListItem.Content.add(<FaxPdfRenderer key="fax-pdf-renderer" />, {
    sortOrder: 100,
    if: (props: any) => {
      // Check custom attribute first (most reliable per Twilio Support)
      if (props.message?.attributes?.channelType === 'fax') return true;

      // Check conversation attributes (set by task/Studio Flow)
      const convAttrs = props.message?.conversation?.attributes;
      if (convAttrs?.type === 'fax' || convAttrs?.channel === 'fax') return true;

      // Fallback: Sinch fax-to-email messages contain sinch references in body
      const body = props.message?.source?.body || '';
      return body.includes('sinchfax') || body.includes('sinch');
    },
  });
};
