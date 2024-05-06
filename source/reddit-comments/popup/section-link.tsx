import React, { FC } from 'react';
import { Flex, Link, Separator, Text } from '@radix-ui/themes';

const repoUrl = 'https://github.com/nemanjam/reddit-unread-comments';

const SectionLink: FC = () => {
  return (
    <Flex width="100%">
      <Flex direction="column" align="start" gap="2" grow="1">
        <Text as="label" size="1">
          Feedback and suggestions:
        </Text>
        <Link size="1" href={repoUrl}>
          {repoUrl}
        </Link>
      </Flex>
      <Separator orientation="vertical" size="2" mx="4" />
      <Flex direction="column" align="end" gap="2">
        <Text as="label" size="1">
          Reddit Unread Comments
        </Text>
        <Text as="label" size="1">
          Version: 1.1.1
        </Text>
      </Flex>
    </Flex>
  );
};

export default SectionLink;
