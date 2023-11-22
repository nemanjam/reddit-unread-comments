import React, { FC } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Flex, Text, Slider, Switch, RadioGroup } from '@radix-ui/themes';

import { SettingsFormData } from './popup';

type Props = {
  register: UseFormRegister<SettingsFormData>;
};

const SectionTime: FC<Props> = ({ register }) => {
  console.error('my rerender 1');

  const { max, min, ...timeSliderRegister } = register('timeSlider', {
    onChange: (e) => {
      // console.error('e', e);
    },
  });

  return (
    <Flex direction="column" gap="4">
      <Text as="label" size="2">
        <Flex gap="2">
          <Switch {...register('isHighlightOnTime')} defaultChecked /> Highlight based on
          time
        </Flex>
      </Text>
      <Slider {...timeSliderRegister} defaultValue={[50]} />
      <RadioGroup.Root {...register('timeScale')} defaultValue="6h">
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
  );
};

export default SectionTime;
