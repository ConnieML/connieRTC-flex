/*
 * Voicemail-Only Greeting Function
 * 
 * This function provides a streamlined voicemail experience where callers:
 * 1. Hear a greeting
 * 2. Leave a voicemail
 * 3. Task is created in Flex
 * 4. Email notification is sent to admins
 * 5. Call ends
 *
 * No hold queue or callback options are provided.
 */

const { twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const TaskRouterOperations = require(Runtime.getFunctions()['common/twilio-wrappers/taskrouter'].path);

// Configuration options
const options = {
  sayOptions: { 
    voice: 'Polly.Matthew-Neural',
    language: 'en-US'
  },
  messages: {
    initialGreeting: 'Thank you for calling Hospital to Home, a division of Nevada Senior Services. Our hours are Monday-Friday from 9am-5pm. If you are experiencing a medical emergency, please hang up and dial 911. For all other callers, please leave a message with the date, time and reason for your call. All calls will be returned within 24-48 hours. Please leave your message after the beep. When you are finished, you may hang up or press the star key.',
    voicemailNotCaptured: "Sorry, we weren't able to capture your message. Please try again.",
    voicemailRecorded: 'Your voicemail has been successfully recorded. Thank you for calling. Goodbye.',
    processingError: 'Sorry, we experienced a technical issue. Please try your call again later.',
  },
  recordingOptions: {
    timeout: 10,              // Start recording after 10 seconds of silence
    finishOnKey: '*',         // Press * to end recording
    maxLength: 300,           // Maximum 5 minutes
    playBeep: true,
    transcribe: true,         // Enable transcription for email
    trim: 'trim-silence'      // Remove silence from start/end
  }
};

/**
 * Enhanced environment variable validation
 */
function validateEnvironment(context) {
  const required = {
    ACCOUNT_SID: context.ACCOUNT_SID,
    AUTH_TOKEN: context.AUTH_TOKEN,
    TWILIO_FLEX_WORKSPACE_SID: context.TWILIO_FLEX_WORKSPACE_SID,
    ADMIN_EMAIL: context.ADMIN_EMAIL,
    MAILGUN_DOMAIN: context.MAILGUN_DOMAIN,
    MAILGUN_API_KEY: context.MAILGUN_API_KEY
  };

  const missing = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate email format
  if (!context.ADMIN_EMAIL.includes('@')) {
    throw new Error('ADMIN_EMAIL must be a valid email address');
  }

  return true;
}

/**
 * Main handler function
 */
exports.handler = async function(context, event, callback) {
  console.log('Voicemail-only greeting handler started', {
    callSid: event.CallSid,
    from: event.From,
    to: event.To,
    mode: event.mode
  });

  const twiml = new Twilio.twiml.VoiceResponse();

  try {
    // Validate environment on first call
    if (!event.mode) {
      validateEnvironment(context);
    }

    // Get base URL for callbacks
    const baseUrl = `https://${context.DOMAIN_NAME}`;
    const functionPath = '/features/voicemail-only-with-email/voicemail-greeting';

    // Mode 1: Initial greeting and recording
    if (!event.mode) {
      console.log('Mode: Initial greeting');
      
      twiml.say(options.sayOptions, options.messages.initialGreeting);
      
      // Set up recording with all callback parameters
      const recordingCallbackUrl = `${baseUrl}${functionPath}?mode=voicemail-recorded` +
        `&CallSid=${event.CallSid}` +
        `&From=${encodeURIComponent(event.From)}` +
        `&To=${encodeURIComponent(event.To)}` +
        `&Called=${encodeURIComponent(event.Called || event.To)}` +
        `&Caller=${encodeURIComponent(event.Caller || event.From)}`;

      const transcriptionCallbackUrl = `${baseUrl}/features/voicemail-only-with-email/send-voicemail-email`;

      twiml.record({
        action: recordingCallbackUrl,
        method: 'POST',
        timeout: options.recordingOptions.timeout,
        finishOnKey: options.recordingOptions.finishOnKey,
        maxLength: options.recordingOptions.maxLength,
        playBeep: options.recordingOptions.playBeep,
        transcribe: options.recordingOptions.transcribe,
        transcribeCallback: transcriptionCallbackUrl,
        trim: options.recordingOptions.trim
      });

      // Fallback if no recording is made
      twiml.say(options.sayOptions, options.messages.voicemailNotCaptured);
      twiml.hangup();

      return callback(null, twiml);
    }

    // Mode 2: After recording is complete
    if (event.mode === 'voicemail-recorded') {
      console.log('Mode: Voicemail recorded', {
        recordingUrl: event.RecordingUrl,
        recordingDuration: event.RecordingDuration,
        recordingSid: event.RecordingSid
      });

      // Check if we got a valid recording (handle both string and number)
      if (!event.RecordingUrl || event.RecordingDuration === '0' || event.RecordingDuration === 0) {
        console.warn('No valid recording captured');
        twiml.say(options.sayOptions, options.messages.voicemailNotCaptured);
        twiml.hangup();
        return callback(null, twiml);
      }

      // Create task in Flex
      try {
        // Use H2H Voicemail workflow for proper queue routing
        const workflowSid = 'WW977b81b28177a83656c903094ed10037'; // H2H Voicemail workflow

        const taskAttributes = {
          call_sid: event.CallSid,
          direction: 'inbound',
          from: event.From,
          to: event.To,
          name: `H2H Voicemail from ${event.From} → ${event.To}`,
          taskType: 'voicemail',
          
          // H2H Voicemail identification
          conversations: {
            conversation_id: event.CallSid,
            conversation_measure_1: 'H2H Voicemail',
            conversation_measure_2: event.To, // Phone number called
            conversation_measure_3: event.From, // Caller number
            conversation_measure_4: 'Hospital to Home',
            conversation_measure_5: 'Voicemail Only'
          },
          
          // Voicemail-specific data
          callBackData: {
            isVoicemail: true,
            voicemailOnly: true,
            isH2HVoicemail: true,
            department: 'Hospital to Home',
            phoneNumber: event.To,
            callerNumber: event.From,
            recordingUrl: event.RecordingUrl,
            recordingDuration: parseInt(event.RecordingDuration) || 0,
            recordingSid: event.RecordingSid,
            transcriptionStatus: 'pending',
            timestamp: new Date().toISOString(),
            attempts: 0
          }
        };

        const taskResult = await twilioExecute(context, (client) =>
          TaskRouterOperations.createTask({
            context,
            workflowSid,
            taskChannel: 'voice',
            attributes: taskAttributes,
            priority: 50,        // Standard priority for voicemails
            timeout: 86400       // 24 hour timeout
          })
        );

        console.log('Voicemail task created successfully', {
          taskSid: taskResult.data?.sid,
          workflowSid
        });

        // Store task SID for transcription callback to update later
        // Note: Email sending happens in the transcription callback
        
      } catch (error) {
        console.error('Error creating Flex task:', {
          error: error.message,
          stack: error.stack
        });
        // Don't fail the call - continue to thank the caller
      }

      // Thank the caller and end the call
      twiml.say(options.sayOptions, options.messages.voicemailRecorded);
      twiml.hangup();

      return callback(null, twiml);
    }

    // Unknown mode - error handling
    console.error('Unknown mode:', event.mode);
    twiml.say(options.sayOptions, options.messages.processingError);
    twiml.hangup();
    
    return callback(null, twiml);

  } catch (error) {
    console.error('Fatal error in voicemail greeting:', {
      error: error.message,
      stack: error.stack,
      event
    });
    
    // Graceful error response to caller
    twiml.say(options.sayOptions, options.messages.processingError);
    twiml.hangup();
    
    return callback(null, twiml);
  }
};

/**
 * Helper function to get default workflow SID
 * Attempts to find the "Assign to Anyone" workflow
 */
async function getDefaultWorkflowSid(context) {
  try {
    const workflows = await twilioExecute(context, (client) =>
      client.taskrouter
        .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .workflows
        .list({ limit: 50 })
    );

    const defaultWorkflow = workflows.find(wf => 
      wf.friendlyName.toLowerCase().includes('assign to anyone') ||
      wf.friendlyName.toLowerCase().includes('everyone')
    );

    if (defaultWorkflow) {
      console.log('Found default workflow:', defaultWorkflow.friendlyName, defaultWorkflow.sid);
      return defaultWorkflow.sid;
    }
  } catch (error) {
    console.error('Error finding default workflow:', error.message);
  }
  
  return null;
}