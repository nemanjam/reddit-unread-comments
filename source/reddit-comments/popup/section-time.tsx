import React, { FC } from 'react';
import { Flex, Text, Slider, Box, Switch, RadioGroup } from '@radix-ui/themes';

const SectionTime: FC = () => {
  return (
    <Box>
      <Flex direction="column" gap="4">
        <Text as="label" size="2">
          <Flex gap="2">
            <Switch defaultChecked /> Highlight based on time only
          </Flex>
        </Text>
        <Slider defaultValue={[50]} />
        <RadioGroup.Root defaultValue="6h">
          <Flex gap="2">
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="1h" /> 1h
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="6h" /> 6h
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="1 day" /> 1 day
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="1 week" /> 1 week
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="1 month" /> 1 month
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="1 year" /> 1 year
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <RadioGroup.Item value="5 years" /> 5 years
              </Flex>
            </Text>
          </Flex>
        </RadioGroup.Root>
      </Flex>
    </Box>
  );
};

export default SectionTime;
