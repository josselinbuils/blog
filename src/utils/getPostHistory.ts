import childProcess from 'child_process';
import path from 'path';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export function getPostHistory(filename: string): {
  commitDate: string;
  commitHash: string;
  commitSubject: string;
}[] {
  try {
    return childProcess
      .execSync(
        `git log --follow --no-merges --name-only --format="%H %at %s" -p ${path.join(
          process.cwd(),
          'src/posts',
          filename,
        )}`,
      )
      .toString()
      .trim()
      .split('\n')
      .filter(
        (line) => /^[a-z0-9]{40} \d+/.test(line) && line.includes('#post'),
      )
      .map((line) => {
        const result = line.split(' ');
        return {
          commitDate: dayjs(parseInt(result[1], 10) * 1000).format(
            'MMM D, YYYY',
          ),
          commitHash: result[0],
          commitSubject: result.slice(2).join(' ').split(' #post')[0],
        };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
}
