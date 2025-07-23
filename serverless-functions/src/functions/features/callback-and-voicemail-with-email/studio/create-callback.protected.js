const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);
const CallbackOperations = require(Runtime.getFunctions()['features/callback-and-voicemail/common/callback-operations']
  .path);

const requiredParameters = [
  { key: 'numberToCall', purpose: 'the number of the customer to call' },
  {
    key: 'numberToCallFrom',
    purpose: 'the number to call the customer from',
  },
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const {
      numberToCall,
      numberToCallFrom,
      flexFlowSid,
      workflowSid: overriddenWorkflowSid,
      timeout: overriddenTimeout,
      priority: overriddenPriority,
      attempts: retryAttempt,
      conversation_id,
      utcDateTimeReceived,
      recordingSid,
      RecordingSid,
      recordingUrl,
      RecordingUrl,
      transcriptSid,
      TranscriptionSid,
      transcriptText,
      TranscriptionText,
      isDeleted,
      taskChannel: overriddenTaskChannel,
      voicemailOnly,
    } = event;

    const result = await CallbackOperations.createCallbackTask({
      context,
      numberToCall,
      numberToCallFrom,
      flexFlowSid,
      overriddenWorkflowSid,
      overriddenTimeout,
      overriddenPriority,
      retryAttempt,
      conversation_id,
      utcDateTimeReceived,
      recordingSid: recordingSid || RecordingSid,
      recordingUrl: recordingUrl || RecordingUrl,
      transcriptSid: transcriptSid || TranscriptionSid,
      transcriptText: transcriptText || TranscriptionText,
      isDeleted,
      overriddenTaskChannel,
    });

    const { status, data: task } = result;

    // Send email notification for voicemail-only tasks
    if (voicemailOnly === 'true' && (recordingSid || RecordingSid) && context.ADMIN_EMAIL && context.MAILGUN_DOMAIN && context.MAILGUN_API_KEY) {
      try {
        console.log('Sending voicemail-only email notification...');
        
        const emailFunction = Runtime.getFunctions()['features/callback-and-voicemail-with-email/studio/send-voicemail-email'].path;
        const emailHandler = require(emailFunction);
        
        await new Promise((resolve, reject) => {
          emailHandler.handler(context, {
            RecordingUrl: recordingUrl || RecordingUrl,
            RecordingSid: recordingSid || RecordingSid,
            TranscriptionText: transcriptText || TranscriptionText || 'Transcription not available',
            From: numberToCall,
            To: numberToCallFrom,
            Timestamp: Math.floor(Date.now() / 1000)
          }, (error, result) => {
            if (error) {
              console.error('Email sending failed:', error);
              reject(error);
            } else {
              console.log('Email sent successfully for voicemail-only task:', task.sid);
              resolve(result);
            }
          });
        });
      } catch (emailError) {
        console.error('Error sending voicemail-only email:', emailError);
        // Don't fail the task creation if email fails
      }
    }

    response.setStatusCode(status);
    response.setBody({ taskSid: task.sid, ...extractStandardResponse(result) });
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});
