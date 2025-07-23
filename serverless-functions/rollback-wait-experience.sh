#!/bin/bash

# Rollback script for wait-experience function
# Use this if the voicemail-only modification causes any issues

echo "🔄 Rolling back wait-experience function to backup..."

# Find the most recent backup
BACKUP_FILE=$(ls -t src/functions/features/callback-and-voicemail-with-email/studio/wait-experience.protected.js.backup-* 2>/dev/null | head -1)

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ No backup file found!"
    echo "Cannot rollback without a backup."
    exit 1
fi

echo "📋 Found backup: $BACKUP_FILE"

# Create a rollback backup of the current version
CURRENT_BACKUP="src/functions/features/callback-and-voicemail-with-email/studio/wait-experience.protected.js.rollback-$(date +%Y%m%d-%H%M%S)"
cp src/functions/features/callback-and-voicemail-with-email/studio/wait-experience.protected.js "$CURRENT_BACKUP"
echo "✅ Created rollback backup: $CURRENT_BACKUP"

# Restore from backup
cp "$BACKUP_FILE" src/functions/features/callback-and-voicemail-with-email/studio/wait-experience.protected.js
echo "✅ Restored from backup"

echo ""
echo "🚀 Ready to deploy. Run these commands:"
echo "   npm run deploy"
echo ""
echo "📝 Notes:"
echo "- The modified version is saved as: $CURRENT_BACKUP"
echo "- Original 7027079496 workflow will work exactly as before"
echo "- Remove ?voicemailOnly=true from any Studio Flows using it"