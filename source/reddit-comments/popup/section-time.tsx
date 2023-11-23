import React, { FC } from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { Flex, Text, Slider, Switch, RadioGroup } from '@radix-ui/themes';

import { SettingsFormData } from './popup';

type Props = {
  control: Control<SettingsFormData, FieldPath<SettingsFormData>>;
};

const SectionTime: FC<Props> = ({ control }) => {
  console.error('my rerender 1');

  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Controller
            name="isHighlightOnTime"
            control={control}
            render={({ field }) => (
              <>
                <Switch checked={field.value} onCheckedChange={field.onChange} />{' '}
                Highlight based one time
              </>
            )}
          />
        </Flex>
      </Text>
      <Controller
        name="timeSlider"
        control={control}
        render={({ field }) => (
          <Slider
            onValueChange={(value) => field.onChange(value[0])}
            defaultValue={[field.value]}
            max={100} // needs to change with radio
            step={10}
          />
        )}
      />
      <Controller
        name="timeScale"
        control={control}
        render={({ field }) => (
          <RadioGroup.Root onValueChange={field.onChange} defaultValue={field.value}>
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
        )}
      />
    </Flex>
  );
};

export default SectionTime;
