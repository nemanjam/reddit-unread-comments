import React, { FC, useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Flex, Text, Slider, Switch, RadioGroup } from '@radix-ui/themes';

import { SettingsData, TimeScaleType } from '../database/schema';
import { defaultValues } from '../database/models/settings';
import usePrevious from './usePrevious';
import useIsMounting from './useIsMounting';

export interface SliderProps {
  max: number;
  step: number;
  unit: string;
}

type Props = {
  form: UseFormReturn<SettingsData>;
  onSubmit: (settingsData: SettingsData) => Promise<void>;
};

const SectionTime: FC<Props> = ({ form, onSubmit }) => {
  const { control, watch, setValue, handleSubmit } = form;

  const timeScale = watch('timeScale');
  const timeSlider = watch('timeSlider');
  const isHighlightOnTime = watch('isHighlightOnTime');
  const isDisabledSection = !isHighlightOnTime;

  const prevIsDisabledSection = usePrevious(isDisabledSection);
  const prevTimeScale = usePrevious(timeScale);

  const { isMounting } = useIsMounting();

  // reset slider and radio on switch false
  useEffect(() => {
    // on transition only
    if (!isMounting && isDisabledSection && prevIsDisabledSection !== isDisabledSection) {
      setValue('timeSlider', defaultValues.timeSlider);
      setValue('timeScale', defaultValues.timeScale);
      // persist to db
      handleSubmit(onSubmit)();
    }
  }, [isMounting, isDisabledSection, prevIsDisabledSection]);

  // reset slider on radio change
  // todo: triggered onMount too and overrides db
  // todo: skip on popup close
  // this resets, has transition, needs additional check condition
  useEffect(() => {
    if (!isMounting && prevTimeScale !== timeScale)
      setValue(
        'timeSlider',
        defaultValues.timeSlider // should set to 0 and save to db
      );
    // persist to db
    handleSubmit(onSubmit)();
  }, [isMounting, timeScale, prevTimeScale]);

  const getSliderPropsFromScale = (timeScale: TimeScaleType): SliderProps => {
    const sliderPropsMap = {
      '1h': { max: 60, step: 1, unit: 'min' },
      '6h': { max: 6, step: 1, unit: 'h' },
      '1 day': { max: 24, step: 1, unit: 'h' },
      '1 week': { max: 7, step: 1, unit: 'days' },
      '1 month': { max: 30, step: 1, unit: 'days' },
      '1 year': { max: 12, step: 1, unit: 'months' },
      '10 years': { max: 10, step: 1, unit: 'years' },
    };
    return sliderPropsMap[timeScale];
  };

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
