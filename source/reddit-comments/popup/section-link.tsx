import React, { FC } from 'react';
import { Flex, Link, Text } from '@radix-ui/themes';

const repoUrl = 'https://github.com/nemanjam/reddit-unread-comments';

const SectionLink: FC = () => {
  return (
    <Flex direction="column" align="start" gap="2">
      <Text as="label" size="1">
        Feedback and suggestions:
      </Text>
      <Link size="1" href={repoUrl}>
        {repoUrl}
      </Link>
    </Flex>
  );
};

export default SectionLink;
