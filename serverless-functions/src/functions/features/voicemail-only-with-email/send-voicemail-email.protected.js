/*
 * Send voicemail email notification with recording attachment via Mailgun
 * This function is triggered after a voicemail is recorded and sends an email
 * to the admin with the recording attached.
 * 
 * For voicemail-only-with-email feature:
 * - Also updates the Flex task with transcription when available
 */
const axios = require('axios');
const FormData = require('form-data');
const TaskRouterOperations = require(Runtime.getFunctions()['common/twilio-wrappers/taskrouter'].path);
const { twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

exports.handler = async function(context, event, callback) {
  console.log('Email notification handler triggered with event:', JSON.stringify(event, null, 2));

  // Enhanced environment variable validation as recommended by Twilio Support
  const requiredEnvVars = {
    ADMIN_EMAIL: context.ADMIN_EMAIL,
    MAILGUN_DOMAIN: context.MAILGUN_DOMAIN,
    MAILGUN_API_KEY: context.MAILGUN_API_KEY,
    ACCOUNT_SID: context.ACCOUNT_SID,
    AUTH_TOKEN: context.AUTH_TOKEN
  };

  const missingVars = [];
  const invalidVars = [];

  for (const [varName, varValue] of Object.entries(requiredEnvVars)) {
    if (!varValue) {
      missingVars.push(varName);
    } else {
      // Basic format validation
      switch (varName) {
        case 'ADMIN_EMAIL':
          if (!varValue.includes('@') || !varValue.includes('.')) {
            invalidVars.push(`${varName} (invalid email format)`);
          }
          break;
        case 'MAILGUN_DOMAIN':
          if (!varValue.includes('.')) {
            invalidVars.push(`${varName} (invalid domain format)`);
          }
          break;
        case 'MAILGUN_API_KEY':
          // Mailgun API keys can start with 'key-' (domain keys) or other prefixes (private keys)
          // Just check that it's a reasonable length and not obviously invalid
          if (varValue.length < 20) {
            invalidVars.push(`${varName} (appears too short - should be at least 20 characters)`);
          }
          break;
        case 'ACCOUNT_SID':
          if (!varValue.startsWith('AC')) {
            invalidVars.push(`${varName} (should start with 'AC')`);
          }
          break;
        case 'AUTH_TOKEN':
          if (varValue.length < 20) {
            invalidVars.push(`${varName} (appears too short)`);
          }
          break;
      }
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('Environment validation failed:', errorMsg);
    return callback(errorMsg);
  }

  if (invalidVars.length > 0) {
    const errorMsg = `Invalid environment variable formats: ${invalidVars.join(', ')}`;
    console.error('Environment validation failed:', errorMsg);
    return callback(errorMsg);
  }

  console.log('Environment variable validation passed successfully');

  // Extract event data
  const recordingUrl = event.RecordingUrl;
  const caller = event.From || event.callerNumber || 'Unknown Caller';
  const called = event.To || event.calledNumber || 'Unknown Number';
  const recordingSid = event.RecordingSid;
  const transcriptionText = event.TranscriptionText || 'Transcription not available';
  
  // Use event.Timestamp if available for precise recording time (UTC format)
  const timestamp = event.Timestamp ? new Date(event.Timestamp * 1000).toISOString() : new Date().toISOString();

  if (!recordingUrl || !recordingSid) {
    console.error('Required recording information missing:', { recordingUrl, recordingSid });
    return callback('Recording URL and SID are required');
  }

  try {
    // Append .wav if not present (Twilio RecordingUrl is base; media fetch needs extension)
    let fullRecordingUrl = recordingUrl;
    if (!fullRecordingUrl.endsWith('.wav')) {
      fullRecordingUrl += '.wav';
    }

    console.log('Fetching recording from URL:', fullRecordingUrl);

    // Fetch the recording audio with authentication
    const response = await axios.get(fullRecordingUrl, { 
      responseType: 'arraybuffer',
      auth: {
        username: context.ACCOUNT_SID,
        password: context.AUTH_TOKEN
      },
      timeout: 30000 // 30 second timeout as recommended by Twilio Support
    });

    const audioBuffer = Buffer.from(response.data);
    const fileSizeInMB = audioBuffer.length / (1024 * 1024);
    
    console.log('Recording fetched successfully, size:', audioBuffer.length, 'bytes', `(${fileSizeInMB.toFixed(2)} MB)`);

    // File size check as recommended by Twilio Support
    const maxFileSizeMB = 20; // Conservative limit below Mailgun's 25MB to account for email overhead
    if (fileSizeInMB > maxFileSizeMB) {
      console.warn(`Recording file size (${fileSizeInMB.toFixed(2)} MB) exceeds maximum (${maxFileSizeMB} MB). Sending download link instead of attachment.`);
      
      // Send email with download link instead of attachment for large files
      const emailBody = `
New voicemail received:

From: ${caller}
To: ${called}
Date: ${timestamp}
Recording ID: ${recordingSid}
File Size: ${fileSizeInMB.toFixed(2)} MB

Transcription:
${transcriptionText}

The voicemail recording is too large to attach directly. 
You can access it here: ${recordingUrl}

Note: This link requires Twilio account authentication to access.

---
This is an automated message. Please do not reply.
      `.trim();

      // Prepare email without attachment
      const form = new FormData();
      form.append('from', `Voicemail Alert <voicemail@${context.MAILGUN_DOMAIN}>`);
      // Support multiple admin emails (comma-separated) - consistent parsing
      const adminEmails = context.ADMIN_EMAIL.split(',').map(email => email.trim()).join(',');
      form.append('to', adminEmails);
      form.append('subject', `New Voicemail from ${caller} (Large File - Download Link)`);
      form.append('text', emailBody);

      // Send to Mailgun without attachment
      const mailgunResponse = await axios.post(
        `https://api.mailgun.net/v3/${context.MAILGUN_DOMAIN}/messages`,
        form,
        {
          auth: { username: 'api', password: context.MAILGUN_API_KEY },
          headers: form.getHeaders(),
          timeout: 30000
        }
      );

      console.log('Large file email (download link) sent successfully. Mailgun ID:', mailgunResponse.data.id);
      
      return callback(null, { 
        success: true, 
        mailgunId: mailgunResponse.data.id,
        emailSentTo: context.ADMIN_EMAIL,
        recordingSid: recordingSid,
        attachmentMethod: 'download_link',
        fileSizeMB: fileSizeInMB.toFixed(2)
      });
    }

    // Parse admin emails into array
    const adminEmailArray = context.ADMIN_EMAIL.includes(',') 
      ? context.ADMIN_EMAIL.split(',').map(email => email.trim())
      : [context.ADMIN_EMAIL.trim()];

    // Create professional ConnieRTC branded HTML email body
    const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Voicemail</title>
    <style>
        body { 
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
            color: #23254B;
            padding: 2rem 1rem;
            line-height: 1.6;
        }
        .container { 
            max-width: 580px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.98);
            border-radius: 17px;
            overflow: hidden;
            box-shadow: 0 4px 24px 0 rgba(122, 99, 187, 0.12);
        }
        .header { 
            padding: 2rem 2rem 1rem 2rem; 
            text-align: center;
            background: rgba(255,255,255,0.95);
        }
        .logo { 
            margin-bottom: 1.5rem;
        }
        .logo img {
            height: 48px;
            width: auto;
            object-fit: contain;
        }
        .header h2 { 
            margin: 0; 
            font-size: 1.5rem; 
            font-weight: 650;
            letter-spacing: -0.01em;
            color: #23254B;
        }
        .content {
            padding: 0 2rem 2rem 2rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .info-item { 
            padding: 1rem 1.2rem;
            background: #f5f7fb;
            border: 1.8px solid #ebe6f8;
            border-radius: 11px;
            transition: border 0.18s;
        }
        .info-item:hover {
            border-color: #ec4899;
        }
        .label { 
            font-weight: 600; 
            color: #6668a1;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.3rem;
            display: block;
        }
        .value {
            color: #23254B;
            font-weight: 500;
            font-size: 1rem;
        }
        .transcription { 
            background: rgba(236, 72, 153, 0.03);
            border: 1.8px solid rgba(236, 72, 153, 0.15);
            padding: 1.5rem;
            border-radius: 11px;
            margin: 1.5rem 0;
        }
        .transcription h4 {
            margin: 0 0 1rem 0;
            color: #23254B;
            font-weight: 650;
            font-size: 1.1rem;
        }
        .transcription p {
            margin: 0;
            color: #23254B;
            font-style: italic;
            line-height: 1.7;
        }
        .attachment-note { 
            background: linear-gradient(90deg, #ec4899, #8b5cf6 94%);
            color: white;
            padding: 1.2rem 1.5rem;
            border-radius: 11px;
            margin: 1.5rem 0;
            text-align: center;
        }
        .attachment-note strong {
            font-weight: 700;
        }
        .footer { 
            margin-top: 2rem; 
            padding-top: 1.5rem; 
            border-top: 1.8px solid #ebe6f8;
            font-size: 0.85rem; 
            color: #6668a1;
            text-align: center;
            line-height: 1.5;
        }
        @media (max-width: 600px) {
            body { padding: 1rem 0.5rem; }
            .container { border-radius: 12px; }
            .header, .content { padding-left: 1.5rem; padding-right: 1.5rem; }
            .info-grid { grid-template-columns: 1fr; }
            .logo img { height: 40px; }
            .header h2 { font-size: 1.3rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://docs.connie.one/img/logos/connie-rtc-docs-logo.png" alt="ConnieRTC Logo">
            </div>
            <h2>New Voicemail Received</h2>
        </div>
        
        <div class="content">
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">From</span>
                    <span class="value">${caller}</span>
                </div>
                <div class="info-item">
                    <span class="label">To</span>
                    <span class="value">${called}</span>
                </div>
                <div class="info-item">
                    <span class="label">Date</span>
                    <span class="value">${new Date(timestamp).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="label">Recording ID</span>
                    <span class="value">${recordingSid.substring(0, 8)}...${recordingSid.substring(recordingSid.length - 4)}</span>
                </div>
            </div>

            <div class="transcription">
                <h4>Transcription</h4>
                <p>${transcriptionText}</p>
            </div>

            <div class="attachment-note">
                <strong>🎵 Audio Recording Attached</strong><br>
                The voicemail recording is attached as a .wav file.
            </div>

            <div class="footer">
                This is an automated message from your ConnieRTC voicemail system.<br>Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Create fallback text version
    const emailBodyText = `
New voicemail received:

From: ${caller}
To: ${called}
Date: ${new Date(timestamp).toLocaleString()}
Recording ID: ${recordingSid}

Transcription:
${transcriptionText}

The audio recording is attached to this email.

---
This is an automated message. Please do not reply.
    `.trim();

    console.log('Sending enhanced emails to:', adminEmailArray);

    // Use Mailgun batch sending with recipient variables for cleaner delivery
    const form = new FormData();
    form.append('from', `Voicemail Alert <voicemail@${context.MAILGUN_DOMAIN}>`);
    
    // Add all recipients
    adminEmailArray.forEach(email => {
      form.append('to', email);
    });
    
    form.append('subject', `New Voicemail from ${caller}`);
    form.append('html', emailBodyHtml);
    form.append('text', emailBodyText);
    form.append('attachment', audioBuffer, { 
      filename: `voicemail-${recordingSid}.wav`, 
      contentType: 'audio/wav' 
    });

    // Send single API call to multiple recipients
    const mailgunResponse = await axios.post(
      `https://api.mailgun.net/v3/${context.MAILGUN_DOMAIN}/messages`,
      form,
      {
        auth: { username: 'api', password: context.MAILGUN_API_KEY },
        headers: form.getHeaders(),
        timeout: 30000
      }
    );

    // Enhanced logging for observability as recommended by Twilio Support
    console.log('Enhanced HTML email sent successfully. Details:', {
      mailgunId: mailgunResponse.data.id,
      emailsSentTo: adminEmailArray,
      recordingSid: recordingSid,
      fileSizeMB: fileSizeInMB.toFixed(2),
      attachmentMethod: 'direct_attachment',
      timestamp: new Date().toISOString(),
      caller: caller,
      deliveryStatus: 'sent',
      emailCount: adminEmailArray.length,
      emailFormat: 'html_with_text_fallback'
    });

    // Update Flex task with transcription if available
    if (event.CallSid && transcriptionText && transcriptionText !== 'Transcription not available') {
      try {
        // Find the task by call SID
        const workflowSid = context.VOICEMAIL_WORKFLOW_SID || 'WW68ed6f6bc555f21e436810af747722a9';
        
        const tasks = await twilioExecute(context, async (client) => {
          const taskList = await client.taskrouter
            .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
            .tasks
            .list({
              assignmentStatus: ['pending', 'reserved'],
              limit: 50
            });
          return taskList;
        });

        const voicemailTask = tasks.find(task => {
          const attributes = JSON.parse(task.attributes || '{}');
          return attributes.call_sid === event.CallSid;
        });

        if (voicemailTask) {
          const currentAttributes = JSON.parse(voicemailTask.attributes || '{}');
          const updatedAttributes = {
            ...currentAttributes,
            callBackData: {
              ...currentAttributes.callBackData,
              transcription: transcriptionText,
              transcriptionStatus: 'completed',
              emailSent: true,
              emailSentAt: new Date().toISOString()
            }
          };

          await twilioExecute(context, (client) =>
            client.taskrouter
              .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
              .tasks(voicemailTask.sid)
              .update({
                attributes: JSON.stringify(updatedAttributes)
              })
          );

          console.log('Task updated with transcription:', {
            taskSid: voicemailTask.sid,
            callSid: event.CallSid
          });
        } else {
          console.warn('Could not find task to update with transcription:', {
            callSid: event.CallSid
          });
        }
      } catch (taskError) {
        console.error('Error updating task with transcription:', {
          error: taskError.message,
          callSid: event.CallSid
        });
        // Don't fail the email send if task update fails
      }
    }

    return callback(null, { 
      success: true, 
      mailgunId: mailgunResponse.data.id,
      emailsSentTo: adminEmailArray,
      recordingSid: recordingSid,
      attachmentMethod: 'direct_attachment',
      fileSizeMB: fileSizeInMB.toFixed(2),
      emailCount: adminEmailArray.length,
      emailFormat: 'html_with_text_fallback'
    });

  } catch (error) {
    // Enhanced error logging for observability as recommended by Twilio Support
    const errorMessage = error.message || 'Unknown error';
    const responseData = error.response ? error.response.data : 'No response data';
    const statusCode = error.response ? error.response.status : 'No status code';
    const errorType = error.code || 'unknown_error';

    console.error('Error sending voicemail email. Details:', {
      errorType: errorType,
      message: errorMessage,
      statusCode: statusCode,
      responseData: responseData,
      recordingSid: recordingSid,
      caller: caller,
      timestamp: new Date().toISOString(),
      emailRecipient: context.ADMIN_EMAIL,
      mailgunDomain: context.MAILGUN_DOMAIN,
      deliveryStatus: 'failed',
      stage: error.response ? 'mailgun_api' : 'recording_fetch'
    });

    return callback(`Failed to send voicemail email: ${errorMessage}`);
  }
};