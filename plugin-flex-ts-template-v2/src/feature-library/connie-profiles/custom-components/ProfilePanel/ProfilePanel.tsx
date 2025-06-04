import React, { useState, useEffect } from 'react';
import { ITask } from '@twilio/flex-ui';
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
import { getProfileProxyUrl } from '../../config';

interface ProfileData {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  program: string;
  image?: string;
  [key: string]: any; // Allow for additional properties
}

interface ProfilePanelProps {
  task?: ITask;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ task }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!task) return;
      
      // Get the customer's phone number from the task attributes
      const customerPhone = task.attributes.from || task.attributes.customer;
      if (!customerPhone) {
        setError('No customer phone number found in task attributes');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const proxyUrl = getProfileProxyUrl();
        console.log(`Fetching profile from: ${proxyUrl}?phoneNumber=${encodeURIComponent(customerPhone)}`);
        
        const response = await fetch(`${proxyUrl}?phoneNumber=${encodeURIComponent(customerPhone)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profile data:', data);
        
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setError('No profile found for this customer');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Fix the TypeScript error by properly type checking the error
        if (err instanceof Error) {
          setError(`Error fetching profile: ${err.message}`);
        } else {
          setError('Error fetching profile: Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [task]);
  
  if (loading) {
    return (
      <Box padding="space60" display="flex" justifyContent="center">
        <Spinner size="sizeIcon100" decorative={false} title="Loading profile" />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box padding="space60">
        <Alert variant="error">
          <Heading as="h3" variant="heading30">Error Loading Profile</Heading>
          <Paragraph>{error}</Paragraph>
        </Alert>
      </Box>
    );
  }
  
  if (!profile) {
    return (
      <Box padding="space60">
        <Card>
          <Heading as="h3" variant="heading30">No Profile Available</Heading>
          <Paragraph>No customer profile information is available for this task.</Paragraph>
        </Card>
      </Box>
    );
  }
  
  return (
    <Box padding="space60">
      <Card>
        <Stack orientation="vertical" spacing="space60">
          <Flex>
            <Box paddingRight="space40">
              {profile.image ? (
                <Avatar size="sizeIcon100" src={profile.image} name={`${profile.firstname} ${profile.lastname}`} />
              ) : (
                <Avatar size="sizeIcon100" name={`${profile.firstname} ${profile.lastname}`} />
              )}
            </Box>
            <Stack orientation="vertical" spacing="space20">
              <Heading as="h3" variant="heading30">{profile.firstname} {profile.lastname}</Heading>
              <Text as="p">{profile.phone}</Text>
              {profile.program && (
                <Badge as="span" variant="info">{profile.program}</Badge>
              )}
            </Stack>
          </Flex>
          
          <Separator orientation="horizontal" />
          
          <Stack orientation="vertical" spacing="space40">
            <Heading as="h4" variant="heading40">Customer Details</Heading>
            
            {Object.entries(profile).map(([key, value]) => {
              // Skip certain fields we've already displayed
              if (['id', 'firstname', 'lastname', 'phone', 'program', 'image'].includes(key)) {
                return null;
              }
              
              return (
                <Flex key={key}>
                  <Box width="30%" paddingRight="space40">
                    <Text as="span" fontWeight="fontWeightSemibold">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </Text>
                  </Box>
                  <Box width="70%">
                    <Text as="span">{String(value)}</Text>
                  </Box>
                </Flex>
              );
            })}
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default ProfilePanel;
