  break dom into multiple files
  remove modal from events
  parse exact time from time.datetime iso string
put config vars into single object
  mark as read label in popup ui
review delay values
  fix sort by new selector
wrapper for querySelector that returns Node or throws, not null
  scroll ctrl + space broken
update readme
all exception should be handled in 1-2 chosen levels
everything should throw custom exception classes and log
db wrapper
  mark thread as read button, immediately radio
  add version label
  nested comments, check that only comments content is in viewport

  fix chrome manifest errors

// ovde na pocetku nove sesije oznacava prethodnu kao procitanu
const { threadId, updatedAt } = existingThread;
const updatedComments = await updateCommentsSessionCreatedAtForThread(
  db,
  threadId,
  updatedAt
);
comment.sessionCreatedAt = thread.updatedAt

// zapravo meni treba ovo, da oznacim comments mark as rad za current session, sa 2e12
// a to je addComment()
  const sessionCreatedAt = currentSessionCreatedAt;
  await addComment(db, { threadId, commentId, sessionCreatedAt });