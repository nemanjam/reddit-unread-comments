import React, { FC, useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Slider, Switch, RadioGroup } from '@radix-ui/themes';

import { SettingsData } from '../database/schema';
import { defaultValues } from '../database/models/settings';
import usePrevious from './usePrevious';
import { getSliderPropsFromScale } from '../datetime';

type Props = {
  form: UseFormReturn<SettingsData>;
  isPopupMounting: boolean;
};

const SectionTime: FC<Props> = ({ form, isPopupMounting }) => {
  const { control, watch, setValue } = form;

  const timeScale = watch('timeScale');
  const timeSlider = watch('timeSlider');
  const isHighlightOnTime = watch('isHighlightOnTime');
  const isDisabledSection = !isHighlightOnTime;

  const prevIsDisabledSection = usePrevious(isDisabledSection);
  const prevTimeScale = usePrevious(timeScale);

  // reset slider and radio on switch false
  useEffect(() => {
    // on transition only
    if (
      !isPopupMounting &&
      isDisabledSection &&
      prevIsDisabledSection !== isDisabledSection
    ) {
      setValue('timeSlider', defaultValues.timeSlider);
      setValue('timeScale', defaultValues.timeScale);
    }
  }, [isPopupMounting, isDisabledSection, prevIsDisabledSection]);

  // reset slider on radio change
  // todo: triggered onMount too and overrides db
  // todo: skip on popup close
  // this resets, has transition, needs additional check condition
  useEffect(() => {
    if (!isPopupMounting && prevTimeScale !== timeScale)
      setValue(
        'timeSlider',
        defaultValues.timeSlider // should set to 0 and save to db
      );
  }, [isPopupMounting, timeScale, prevTimeScale]);

  const { max, step, unit } = getSliderPropsFromScale(timeScale);

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Text as="label" size="2">
          <Flex gap="2">
            <Controller
              name="isHighlightOnTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <Switch checked={value} onCheckedChange={onChange} /> Highlight based
                  one time
                </>
              )}
            />
          </Flex>
        </Text>
        <Text as="label">{`${timeSlider} ${unit}`}</Text>
      </Flex>
      <Controller
        name="timeSlider"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Slider
            onValueChange={(chValue) => onChange(chValue[0])}
            value={[value]}
            defaultValue={[value]}
            max={max} // needs to change with radio, defaultMax too
            step={step}
            disabled={isDisabledSection}
          />
        )}
      />
      <Controller
        name="timeScale"
        control={control}
        render={({ field: { onChange, value } }) => (
          <RadioGroup.Root onValueChange={onChange} value={value} defaultValue={value}>
            <Flex gap="2">
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="1h" disabled={isDisabledSection} /> 1h
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="6h" disabled={isDisabledSection} /> 6h
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="1 day" disabled={isDisabledSection} /> 1 day
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="1 week" disabled={isDisabledSection} /> 1 week
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="1 month" disabled={isDisabledSection} /> 1 month
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="1 year" disabled={isDisabledSection} /> 1 year
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="10 years" disabled={isDisabledSection} /> 10
                  years
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
