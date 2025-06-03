import React, { useState, useEffect } from 'react';
import { TaskHelper, ITask } from '@twilio/flex-ui';
import { 
  Box, 
  Card, 
  Heading, 
  Paragraph, 
  Stack, 
  Spinner, 
  Alert, 
  Avatar, 
  Badge, 
  Separator, 
  Text,
  Flex
} from '@twilio-paste/core';
import { getProfileProxyUrl } from '../feature-library/custom-profile-panel/config';

interface ProfileData {
  id: string;
  name: string;
  phone: string;
  program: string;
}

interface ProfilePanelProps {
  task?: ITask;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ task }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const phoneNumber = task.attributes.from || '';
        console.log('ProfilePanel: Original phone number from task:', phoneNumber);
        
        const normalizedPhoneNumber = phoneNumber.replace(/[^+\d]/g, '');
        console.log('ProfilePanel: Normalized phone number:', normalizedPhoneNumber);
        
        if (!normalizedPhoneNumber) {
          console.log('ProfilePanel: No phone number found in task attributes');
          setError('No phone number found');
          setLoading(false);
          return;
        }
        
        // Get profile proxy URL from configuration
        const profileProxyUrl = getProfileProxyUrl();
        console.log('ProfilePanel: Using profile proxy URL:', profileProxyUrl);
        
        // Add timeout to fetch to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          // Fetch profile data with timeout
          const requestUrl = `${profileProxyUrl}?From=${encodeURIComponent(normalizedPhoneNumber)}`;
          console.log('ProfilePanel: Fetching profile from:', requestUrl);
          
          const response = await fetch(
            requestUrl,
            { signal: controller.signal },
          );
          clearTimeout(timeoutId);
          
          const data = await response.json();
          console.log('Profile data response:', data);
          
          if (data.success && data.crm_url) {
            // Extract profile info from the URL parameters
            const url = new URL(data.crm_url);
            const profileData = {
              id: url.searchParams.get('profileId') || 'unknown',
              name: url.searchParams.get('name') || 'Unknown User',
              phone: url.searchParams.get('phone') || normalizedPhoneNumber,
              program: url.searchParams.get('program') || 'No Program'
            };
            setProfile(profileData);
          } else {
            setError(data.error || 'Failed to fetch profile');
          }
        } catch (fetchErr) {
          console.error('Fetch error:', fetchErr);
          setError(
            (fetchErr as { name?: string; message?: string }).name === 'AbortError'
              ? 'Profile request timed out'
              : (fetchErr as { message?: string }).message || 'Failed to fetch profile',
          );
        }
      } catch (err: any) {
        console.error('Error in profile component:', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [task]);

  // If no task is selected, show a placeholder
  if (!task) {
    return (
      <Box padding="space70" width="100%" height="100%" backgroundColor="colorBackgroundBody">
        <Card padding="space70">
          <Stack orientation="vertical" spacing="space60">
            <Heading as="h3" variant="heading30">No Active Call</Heading>
            <Paragraph>Select a task to view caller information.</Paragraph>
          </Stack>
        </Card>
      </Box>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box padding="space70" width="100%" height="100%" backgroundColor="colorBackgroundBody">
        <Flex hAlignContent="center" vAlignContent="center" height="100%">
          <Stack orientation="vertical" spacing="space60">
            <Spinner size="sizeIcon100" decorative={false} title="Loading profile" />
            <Text as="span" fontWeight="fontWeightMedium">Loading profile information...</Text>
          </Stack>
        </Flex>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box padding="space70" width="100%" height="100%" backgroundColor="colorBackgroundBody">
        <Alert variant="error">
          <Heading as="h3" variant="heading30">Error Loading Profile</Heading>
          <Paragraph>{error}</Paragraph>
        </Alert>
      </Box>
    );
  }

  // Show profile information
  return (
    <Box padding="space70" width="100%" height="100%" backgroundColor="colorBackgroundBody">
      <Card padding="space70">
        <Stack orientation="vertical" spacing="space60">
          {/* Header with avatar and name */}
          <Flex>
            <Stack orientation="horizontal" spacing="space40">
              <Avatar size="sizeIcon100" name={profile?.name || 'Unknown'} />
              <Stack orientation="vertical" spacing="space20">
                <Heading as="h3" variant="heading30">{profile?.name || 'Unknown User'}</Heading>
                <Text as="span">{profile?.phone || 'No phone number'}</Text>
                <Badge as="span" variant="new">{profile?.program || 'No Program'}</Badge>
              </Stack>
            </Stack>
          </Flex>
          
          <Separator orientation="horizontal" />
          
          {/* Additional profile details */}
          <Stack orientation="vertical" spacing="space40">
            <Heading as="h4" variant="heading40">Profile Details</Heading>
            
            <Box padding="space40" backgroundColor="colorBackgroundWeak" borderRadius="borderRadius20">
              <Stack orientation="vertical" spacing="space30">
                <Stack orientation="horizontal" spacing="space30">
                  <Text as="span" fontWeight="fontWeightMedium">Profile ID:</Text>
                  <Text as="span">{profile?.id || 'Unknown'}</Text>
                </Stack>
                
                <Stack orientation="horizontal" spacing="space30">
                  <Text as="span" fontWeight="fontWeightMedium">Last Contact:</Text>
                  <Text as="span">Today</Text>
                </Stack>
                
                <Stack orientation="horizontal" spacing="space30">
                  <Text as="span" fontWeight="fontWeightMedium">Status:</Text>
                  <Badge as="span" variant="success">Active</Badge>
                </Stack>
              </Stack>
            </Box>
            
            {/* Call History Section */}
            <Heading as="h4" variant="heading40">Recent Interactions</Heading>
            <Box padding="space40" backgroundColor="colorBackgroundWeak" borderRadius="borderRadius20">
              <Stack orientation="vertical" spacing="space30">
                <Text as="span">Inbound call - 2 days ago</Text>
                <Text as="span">Outbound call - 1 week ago</Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default ProfilePanel;
