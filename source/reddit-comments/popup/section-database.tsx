import React, { FC } from 'react';
import { Flex, Text, Box, RadioGroup, Button } from '@radix-ui/themes';

const SectionDatabase: FC = () => {
  return (
    <Box>
      <Flex gap="4" align="center" justify="between">
        <RadioGroup.Root>
          <Flex gap="2">
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="thread" /> Thread
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="all-threads" /> All threads
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="user-settings" /> User settings
              </Flex>
            </Text>
          </Flex>
        </RadioGroup.Root>
        <Button>Reset</Button>
      </Flex>
    </Box>
  );
};

export default SectionDatabase;
