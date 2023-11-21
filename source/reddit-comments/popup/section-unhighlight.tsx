import React, { FC } from 'react';
import { Flex, Text, Box, RadioGroup } from '@radix-ui/themes';

const SectionUnHighlight: FC = () => {
  return (
    <Box>
      <Flex direction="column" gap="4">
        <Text as="label" size="2">
          Un-highlight comments:
        </Text>
        <RadioGroup.Root defaultValue="on-scroll">
          <Flex gap="2">
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="on-scroll" /> On scroll
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="on-url-change" /> On url change
              </Flex>
            </Text>
          </Flex>
        </RadioGroup.Root>
      </Flex>
    </Box>
  );
};

export default SectionUnHighlight;
