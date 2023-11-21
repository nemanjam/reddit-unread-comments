import React, { FC } from 'react';
import { Flex, Text, RadioGroup } from '@radix-ui/themes';

const SectionScroll: FC = () => {
  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        Scroll to (Ctrl+Space):
      </Text>
      <RadioGroup.Root defaultValue="both">
        <Flex gap="2">
          <Text as="label" size="2">
            <Flex gap="2">
              <RadioGroup.Item value="unread" /> Unread
            </Flex>
          </Text>
          <Text as="label" size="2">
            <Flex gap="2">
              <RadioGroup.Item value="by-date" /> By date
            </Flex>
          </Text>
          <Text as="label" size="2">
            <Flex gap="2">
              <RadioGroup.Item value="both" /> Both
            </Flex>
          </Text>
        </Flex>
      </RadioGroup.Root>
    </Flex>
  );
};

export default SectionScroll;
