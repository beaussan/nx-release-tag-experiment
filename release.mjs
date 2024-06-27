// @ts-check
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release/index.js';

import { inc, valid } from 'semver';

const computeActuallyNextVersion = (projectsVersionData) => {
  const expectedStartVersion = formatDate(new Date());
  return Object.fromEntries(Object.entries(projectsVersionData).map(([projectName, versionData]) => {
    const { currentVersion, newVersion } = versionData;
    if (!newVersion) {
      return [projectName, versionData];
    }
    let computedTag = currentVersion.startsWith(expectedStartVersion) ? inc(currentVersion,'patch') : `${expectedStartVersion}.0`
    return [projectName, { ...versionData, newVersion: computedTag }];
  }));
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = new String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
  const day = date.getDate();

  return `${year}${month}.${day}`;
}

(async () => {
  const options = { dryRun: false, verbose: true };

  const { projectsVersionData } = await releaseVersion({
    // We don't want to update the package.json to have a dirty git state
    dryRun: true,
    verbose: options.verbose,
    projects: ['apps/my-app'],
    gitCommit: false,
    stageChanges: false,
    gitTag: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    }
  });

  if (options.verbose) {
    console.log('projectsVersionData', projectsVersionData);
    console.log('projectsVersionData after transform', computeActuallyNextVersion(projectsVersionData));
  }

  await releaseChangelog({
    versionData: computeActuallyNextVersion(projectsVersionData),
    version: null,
    dryRun: options.dryRun,
    verbose: options.verbose,
    gitCommit: false,
    stageChanges: false,
    gitTag: true,
  });

  process.exit(0);
})();