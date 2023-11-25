import React, { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Box, RadioGroup } from '@radix-ui/themes';

import { SettingsData } from '../database/schema';

type Props = {
  form: UseFormReturn<SettingsData>;
};

const SectionUnHighlight: FC<Props> = ({ form }) => {
  const { control } = form;

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Text as="label" size="2">
          Un-highlight comments:
        </Text>
        <Controller
          name="unHighlightOn"
          control={control}
          render={({ field: { onChange, value } }) => (
            <RadioGroup.Root onValueChange={onChange} value={value} defaultValue={value}>
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
          )}
        />
      </Flex>
    </Box>
  );
};

export default SectionUnHighlight;
