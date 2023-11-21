import React, { FC } from 'react';
import { Flex, Text, Switch } from '@radix-ui/themes';

const SectionSort: FC = () => {
  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Switch defaultChecked /> Sort all threads by new
        </Flex>
      </Text>
    </Flex>
  );
};

export default SectionSort;
