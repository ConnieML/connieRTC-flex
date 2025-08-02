---
sidebar_label: Custom Greetings
sidebar_position: 3  
title: "Custom Greetings Add-On"
---

# Custom Greetings Add-On

Replace generic system messages with professional, branded voice prompts using AI voices or custom recordings.

## What It Does
- Professional AI-generated voice prompts (Polly-Matthew-Neural)
- Custom recorded greetings and messages
- Business hours aware messaging
- Branded organization introductions
- Dynamic content based on caller context

## When to Use
- Professional service delivery requirements
- Brand consistency across voice interactions
- Need business hours awareness
- Want caller-specific personalization
- Compliance requires specific messaging

## Compatible Workflows
- ✅ **Direct**: Professional greeting before agent connection
- ✅ **Direct + Options**: Branded welcome before menu options
- ✅ **Direct to Voicemail**: Custom voicemail instructions

## Voice Options

### AI Generated Voices (Recommended)
- **Polly-Matthew-Neural**: Professional male voice
- **Polly-Joanna-Neural**: Professional female voice
- **Polly-Amy-Neural**: British English accent
- **Multi-language support**: Spanish, French, etc.

### Custom Recordings
- Upload your own WAV/MP3 files
- Professional voice talent recordings
- Organization-specific messaging
- Complete control over content

### Hybrid Approach
- Static recorded intro + dynamic AI content
- Professional branding + real-time information
- Best of both worlds

## Technical Implementation

### Basic Greeting Setup

```javascript
// Text-to-speech greeting
const greeting = {
  text: `Hello and thank you for calling ${context.ORG_NAME}. 
         Your call is important to us.`,
  voice: 'Polly.Matthew-Neural',
  language: 'en-US'
};
```

### Business Hours Awareness

```javascript
const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = [0, 6].includes(now.getDay());
  
  if (isWeekend || hour < 9 || hour >= 17) {
    return {
      text: `Thank you for calling ${context.ORG_NAME}. 
             Our office is currently closed. 
             Normal business hours are Monday through Friday, 9 AM to 5 PM.`,
      voice: 'Polly.Matthew-Neural'
    };
  }
  
  return {
    text: `Hello and thank you for calling ${context.ORG_NAME}. 
           We're here to help you today.`,
    voice: 'Polly.Matthew-Neural'
  };
};
```

### Dynamic Content Integration

```javascript
// Personalized greeting for known callers
const getPersonalizedGreeting = async (caller_number) => {
  const callerInfo = await lookupCaller(caller_number);
  
  if (callerInfo && callerInfo.name) {
    return {
      text: `Hello ${callerInfo.name}, welcome back to ${context.ORG_NAME}. 
             How can we help you today?`,
      voice: 'Polly.Joanna-Neural'
    };
  }
  
  return getStandardGreeting();
};
```

## Greeting Types

### Welcome Greetings
```javascript
const welcomeGreetings = {
  standard: `Thank you for calling ${context.ORG_NAME}. Your call is important to us.`,
  professional: `Good ${getTimeOfDay()}, and thank you for calling ${context.ORG_NAME}. We're committed to providing excellent service.`,
  warm: `Hello! Thanks for calling ${context.ORG_NAME}. We're glad you reached out and we're here to help.`
};
```

### Queue Messages
```javascript
const queueMessages = {
  initial: `Please hold while we connect you with the next available representative.`,
  waiting: `Thank you for your patience. Your call will be answered in the order it was received.`,
  position: `You are number ${position} in line. Your estimated wait time is ${waitTime} minutes.`
};
```

### Voicemail Instructions
```javascript
const voicemailPrompts = {
  standard: `Please leave your name, phone number, and a detailed message after the tone. We'll return your call as soon as possible.`,
  urgent: `If this is an emergency, please hang up and call 911. Otherwise, please leave a detailed message and we'll call you back within 24 hours.`,
  callback: `Please leave your name, phone number, and best time to reach you. We'll call you back during business hours.`
};
```

### Error Messages
```javascript
const errorMessages = {
  invalid_selection: `I'm sorry, that's not a valid option. Let me repeat the menu.`,
  timeout: `I didn't receive a selection. For faster service, I'll connect you with an operator.`,
  system_error: `We're experiencing technical difficulties. Please hold while I connect you with someone who can help.`
};
```

## Advanced Features

### Multi-Language Support
```javascript
const getLanguageGreeting = (language = 'en') => {
  const greetings = {
    en: `Thank you for calling ${context.ORG_NAME}. How can we help you today?`,
    es: `Gracias por llamar a ${context.ORG_NAME}. ¿Cómo podemos ayudarle hoy?`,
    fr: `Merci d'avoir appelé ${context.ORG_NAME}. Comment pouvons-nous vous aider aujourd'hui?`
  };
  
  const voices = {
    en: 'Polly.Matthew-Neural',
    es: 'Polly.Miguel-Neural', 
    fr: 'Polly.Mathieu-Neural'
  };
  
  return {
    text: greetings[language],
    voice: voices[language]
  };
};
```

### Contextual Greetings
```javascript
// Greeting based on call source
const getContextualGreeting = (call_source) => {
  const contextGreetings = {
    website: `Thank you for calling from our website. We see you're interested in our services.`,
    referral: `Thank you for calling. We understand you were referred by one of our partners.`,
    followup: `Hello! This is regarding your recent inquiry. Thank you for calling back.`,
    default: `Thank you for calling ${context.ORG_NAME}. How can we help you today?`
  };
  
  return contextGreetings[call_source] || contextGreetings.default;
};
```

### Seasonal/Event-Based Greetings
```javascript
const getSeasonalGreeting = () => {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  
  // Holiday greetings
  if (month === 11 && day >= 20) { // Late December
    return `Happy holidays from all of us at ${context.ORG_NAME}! How can we help you today?`;
  }
  
  if (month === 0 && day <= 5) { // Early January
    return `Happy New Year from ${context.ORG_NAME}! We're excited to help you in the new year.`;
  }
  
  return getStandardGreeting();
};
```

## Configuration Options

### Voice Settings
```json
{
  "voice_config": {
    "engine": "neural",
    "voice_id": "Matthew",
    "language": "en-US",
    "rate": "medium",
    "pitch": "+0%",
    "volume": "+0dB"
  }
}
```

### Timing Settings
```json
{
  "timing_config": {
    "greeting_pause": 1.0,
    "pre_menu_pause": 0.5,
    "post_error_pause": 1.5,
    "inter_sentence_pause": 0.3
  }
}
```

### Fallback Configuration
```javascript
const fallbackConfig = {
  primary_voice: 'Polly.Matthew-Neural',
  fallback_voice: 'Polly.Matthew',  // Non-neural backup
  error_voice: 'system_default',
  max_length: 300, // seconds
  retry_attempts: 3
};
```

## Integration with Other Add-Ons

### With IVR Functions
```javascript
// Professional menu introductions
const menuGreeting = `${getWelcomeGreeting()} 
                     To better serve you, please select from the following options:`;
```

### With Business Hours
```javascript
// Dynamic greeting based on schedule
const schedule = await getBusinessSchedule();
const greeting = await getScheduleAwareGreeting(schedule);
```

### With CRM Integration
```javascript
// VIP caller recognition
const callerStatus = await getCRMStatus(caller_number);
if (callerStatus === 'vip') {
  greeting.text = `Thank you for calling, valued client. We'll prioritize your call.`;
}
```

## Audio File Management

### File Format Requirements
- **Format**: WAV or MP3
- **Sample Rate**: 8kHz or 16kHz (8kHz recommended for telephony)
- **Bit Depth**: 16-bit
- **Channels**: Mono
- **Duration**: Under 30 seconds per greeting

### Storage Options
```javascript
// Twilio Assets (recommended)
const audioUrl = `https://${context.DOMAIN_NAME}/assets/greeting.mp3`;

// External CDN
const audioUrl = `https://cdn.yourorg.com/audio/greeting.mp3`;

// Dynamic generation
const audioUrl = await generateTTSAudio(greeting.text, greeting.voice);
```

### Caching Strategy
```javascript
// Cache generated TTS for reuse
const cacheKey = `greeting_${hash(greeting.text)}_${greeting.voice}`;
let audioUrl = await getFromCache(cacheKey);

if (!audioUrl) {
  audioUrl = await generateTTSAudio(greeting.text, greeting.voice);
  await saveToCache(cacheKey, audioUrl, 3600); // 1 hour TTL
}
```

## Testing and Quality Assurance

### Audio Quality Testing
- Test on different phone types (mobile, landline, VoIP)
- Check clarity and volume levels
- Verify proper pacing and pronunciation
- Test with background noise scenarios

### Content Testing
```javascript
// A/B test different greeting versions
const greetingVersion = hash(caller_number) % 2;
const greeting = greetingVersion === 0 ? greetingA : greetingB;

// Log for analysis
await logGreetingTest({
  caller: caller_number,
  version: greetingVersion,
  timestamp: new Date()
});
```

### Accessibility Testing
- Test with hearing impaired callers
- Verify compatibility with TTY systems
- Check speech recognition accuracy
- Test multi-language pronunciation

## Best Practices

### Content Guidelines
- Keep greetings under 15 seconds when possible
- Use clear, conversational language
- Avoid jargon or technical terms
- Include organization name early
- End with clear next steps

### Voice Selection
- Choose voices that match your brand
- Consider your audience demographics
- Test with actual callers
- Maintain consistency across all prompts

### Performance Optimization
- Cache frequently used greetings
- Minimize text-to-speech API calls
- Use efficient audio compression
- Monitor response times

### Maintenance
- Regular content updates
- Seasonal greeting rotations
- Monitor for outdated information
- Track caller feedback and preferences