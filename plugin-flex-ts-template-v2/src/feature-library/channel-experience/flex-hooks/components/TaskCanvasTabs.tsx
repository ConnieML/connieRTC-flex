import * as Flex from '@twilio/flex-ui';
import React, { useState, useEffect } from 'react';
import { ITask, withTaskContext } from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import { isFaxChannelEnabled } from '../../config';

interface FaxPdfTabProps {
  task?: ITask;
}

const FaxPdfTabComponent = ({ task }: FaxPdfTabProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      setLoading(false);
      return;
    }

    const fetchPdf = async () => {
      try {
        const conversationSid = task.attributes.conversationSid;
        if (!conversationSid) {
          setError('No conversation found for this task');
          setLoading(false);
          return;
        }

        const manager = Flex.Manager.getInstance();
        const conversation = await manager.conversationsClient.getConversationBySid(conversationSid);
        const messagePaginator = await conversation.getMessages();

        for (const message of messagePaginator.items) {
          const attachedMedia = (message as any).attachedMedia;
          if (!attachedMedia || attachedMedia.length === 0) continue;

          const pdfMedia = Array.from(attachedMedia).find(
            (m: any) => m?.state?.contentType === 'application/pdf',
          );

          if (pdfMedia) {
            const url = await (pdfMedia as any).getContentTemporaryUrl();
            console.log('[FaxPdfTab] PDF URL obtained');
            setPdfUrl(url);
            setLoading(false);
            return;
          }
        }

        setError('No PDF attachment found in conversation');
        setLoading(false);
      } catch (err: any) {
        console.error('[FaxPdfTab] Error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPdf();
  }, [task?.sid]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#606B85' }}>
        Loading fax PDF...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: '#d32f2f' }}>
        {error}
      </div>
    );
  }

  if (!pdfUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%', padding: 8 }}>
      <iframe
        src={pdfUrl}
        title="Fax PDF"
        style={{
          width: '100%',
          height: 'calc(100vh - 300px)',
          border: '1px solid #e1e3ea',
          borderRadius: 4,
          minHeight: 400,
        }}
      />
    </div>
  );
};

const FaxPdfTab = withTaskContext(FaxPdfTabComponent);

export const componentName = FlexComponent.TaskCanvasTabs;
export const componentHook = function addFaxPdfTab(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isFaxChannelEnabled()) return;

  console.log('[Fax Channel] Registering Fax PDF tab on TaskCanvasTabs');
  flex.TaskCanvasTabs.Content.add(
    <Flex.Tab key="fax-pdf" uniqueName="fax-pdf" label="Fax PDF">
      <FaxPdfTab key="fax-pdf-tab-content" />
    </Flex.Tab>,
    {
      sortOrder: 100,
      if: ({ task }) => {
        const { channelType, department, type, channel } = task.attributes as Record<string, string>;
        const isFax =
          channelType === 'fax' ||
          type === 'fax' ||
          channel === 'fax' ||
          (department || '').toLowerCase().startsWith('fax');
        return isFax && (Flex.TaskHelper.isTaskAccepted(task) || Flex.TaskHelper.isInWrapupMode(task));
      },
    },
  );
};
