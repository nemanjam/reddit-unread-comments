import React, { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Box, RadioGroup, Button } from '@radix-ui/themes';

import { SettingsData } from '../database/schema';

type Props = {
  form: UseFormReturn<SettingsData>;
  onResetClick: () => void;
};

const SectionDatabase: FC<Props> = ({ form, onResetClick = () => {} }) => {
  const { control } = form;

  return (
    <Box>
      <Flex gap="4" align="center" justify="between">
        <Controller
          name="resetDb"
          control={control}
          render={({ field: { onChange, value } }) => (
            <RadioGroup.Root onValueChange={onChange} value={value} defaultValue={value}>
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
          )}
        />
        <Button type="button" onClick={onResetClick}>
          Reset
        </Button>
      </Flex>
    </Box>
  );
};

export default SectionDatabase;
