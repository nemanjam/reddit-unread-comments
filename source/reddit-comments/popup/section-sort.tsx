import React, { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Switch } from '@radix-ui/themes';

import { SettingsFormData } from './popup';

type Props = {
  form: UseFormReturn<SettingsFormData>;
};

const SectionSort: FC<Props> = ({ form }) => {
  const { control } = form;

  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Controller
            name="sortAllByNew"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Switch checked={value} onCheckedChange={onChange} /> Sort all threads by
                new
              </>
            )}
          />
        </Flex>
      </Text>
    </Flex>
  );
};

export default SectionSort;
