import React, { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Switch } from '@radix-ui/themes';

import { SettingsData } from '../database/schema';

type Props = {
  form: UseFormReturn<SettingsData>;
};

const SectionLogger: FC<Props> = ({ form }) => {
  const { control } = form;

  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Controller
            name="enableLogger"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Switch checked={value} onCheckedChange={onChange} /> Enable logging
              </>
            )}
          />
        </Flex>
      </Text>
    </Flex>
  );
};

export default SectionLogger;
