import React, { FC } from 'react';
import { Link } from '@radix-ui/themes';

const repoUrl = 'https://github.com/nemanjam/reddit-unread-comments';

const SectionLink: FC = () => {
  return (
    <Link size="1" href={repoUrl}>
      {repoUrl}
    </Link>
  );
};

export default SectionLink;
