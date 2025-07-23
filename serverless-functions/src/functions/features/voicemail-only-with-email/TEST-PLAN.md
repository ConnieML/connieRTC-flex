# Voicemail-Only with Email - Production Test Plan

## Pre-Deployment Verification

### Environment Checklist
- [ ] Twilio CLI profile set to NSS Production
- [ ] All environment variables confirmed in .env
- [ ] Mailgun test email successfully received
- [ ] Backup of current .env created

### Configuration Values
Record these for reference:
- Deployment Domain: _____________________________
- Studio Flow SID: _______________________________
- Test Phone Number: _____________________________
- Admin Email(s): ________________________________

## Deployment Testing

### 1. Basic Functionality Test
**Test Case**: Standard voicemail flow
1. [ ] Call the configured number
2. [ ] Verify greeting plays: "Thank you for calling..."
3. [ ] After beep, leave 30-second test message with:
   - Your name
   - Current date/time
   - Test number (e.g., "Test 1")
4. [ ] Press * to end recording
5. [ ] Verify confirmation: "Your voicemail has been successfully recorded"
6. [ ] Call ends automatically

**Expected Results**:
- [ ] Email received within 60 seconds
- [ ] Email contains audio attachment
- [ ] Transcription is accurate
- [ ] Task appears in Flex queue
- [ ] Recording plays correctly from email

### 2. Edge Case: Silent Recording
**Test Case**: Caller doesn't speak
1. [ ] Call the number
2. [ ] Wait for beep
3. [ ] Stay silent for 15 seconds
4. [ ] Hang up

**Expected Results**:
- [ ] Email still sent
- [ ] Recording attached (even if silent)
- [ ] Transcription shows "Transcription not available" or empty
- [ ] Task created in Flex

### 3. Edge Case: Maximum Length
**Test Case**: Long voicemail
1. [ ] Call the number
2. [ ] Leave continuous message for 4+ minutes
3. [ ] Verify system cuts off at 5 minutes
4. [ ] Confirmation plays

**Expected Results**:
- [ ] Recording is exactly 5 minutes
- [ ] Full recording attached to email
- [ ] Transcription captures what was said

### 4. Multiple Recipients Test
**Test Case**: Verify comma-separated emails work
1. [ ] Update ADMIN_EMAIL to include 2-3 addresses
2. [ ] Redeploy if needed
3. [ ] Leave test voicemail
4. [ ] Check all recipients

**Expected Results**:
- [ ] All recipients receive email
- [ ] Each has full attachment
- [ ] No delivery failures

### 5. Concurrent Calls Test
**Test Case**: Multiple simultaneous voicemails
1. [ ] Have 2-3 people call at same time
2. [ ] Each leaves different message
3. [ ] Verify all are processed

**Expected Results**:
- [ ] All emails sent correctly
- [ ] No mixed up recordings
- [ ] All tasks created in Flex
- [ ] Each recording matches its email

### 6. Network Interruption Test
**Test Case**: Caller hangs up mid-recording
1. [ ] Call and start recording
2. [ ] Speak for 10 seconds
3. [ ] Abruptly hang up

**Expected Results**:
- [ ] Partial recording saved
- [ ] Email sent with partial audio
- [ ] Task created normally

### 7. Special Characters Test
**Test Case**: Test transcription handling
1. [ ] Leave message with:
   - Phone numbers
   - Email addresses
   - Special punctuation
   - Non-English words

**Expected Results**:
- [ ] Transcription handles gracefully
- [ ] No email formatting issues
- [ ] Task displays correctly in Flex

## Post-Deployment Monitoring

### First Hour
- [ ] Monitor function logs for errors
- [ ] Check Mailgun delivery logs
- [ ] Verify no failed tasks in Flex
- [ ] Confirm email delivery times < 1 minute

### First Day
- [ ] Review all voicemail tasks
- [ ] Check for any failed emails
- [ ] Monitor function execution times
- [ ] Verify no memory/timeout issues

### Performance Metrics to Track
- Average recording duration: _______
- Email delivery time: _____________
- Transcription accuracy: __________
- Task creation success rate: ______
- Function error rate: _____________

## Rollback Plan

If critical issues occur:

1. **Immediate**: Switch phone number back to previous flow
2. **Investigate**: Check function logs for errors
3. **Fix**: Deploy fixes or rollback code
4. **Retest**: Run abbreviated test plan

### Rollback Commands
```bash
# Switch to previous Studio Flow in Console
# OR use CLI:
twilio phone-numbers:update +1XXXXXXXXXX \
  --voice-url "PREVIOUS_FLOW_WEBHOOK_URL"
```

## Sign-off

- [ ] All test cases passed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Client notified of go-live

**Tested by**: _______________________
**Date**: ___________________________
**Approved for Production**: [ ] Yes [ ] No

## Notes

_Add any observations, issues, or recommendations here:_