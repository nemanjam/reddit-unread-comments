import React, { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, RadioGroup, Switch, Box } from '@radix-ui/themes';

import { SettingsData } from '../database/schema';

type Props = {
  form: UseFormReturn<SettingsData>;
  count: number;
};

const SectionUnread: FC<Props> = ({ form, count }) => {
  const { control, watch } = form;

  const isHighlightUnread = watch('isHighlightUnread');
  const isDisabledSection = !isHighlightUnread;

  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Controller
            name="isHighlightUnread"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Switch checked={value} onCheckedChange={onChange} />
                Highlight unread
              </>
            )}
          />
          {!isDisabledSection && <Box>Count: {count}</Box>}
        </Flex>
      </Text>
      <Text as="label" size="2">
        Mark as read on:
      </Text>
      <Controller
        name="unHighlightOn"
        control={control}
        render={({ field: { onChange, value } }) => (
          <RadioGroup.Root onValueChange={onChange} value={value}>
            <Flex gap="2">
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="on-scroll" disabled={isDisabledSection} /> On
                  scroll
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="on-url-change" disabled={isDisabledSection} />
                  On url change
                </Flex>
              </Text>
            </Flex>
          </RadioGroup.Root>
        )}
      />
    </Flex>
  );
};

export default SectionUnread;
