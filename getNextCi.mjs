// @ts-check
import { createProjectGraphAsync, workspaceRoot } from '@nx/devkit';
import { releaseVersion } from 'nx/release/index.js';

import * as fs from 'fs';
import * as path from 'node:path';
import { parseDocument, stringify } from 'yaml';

function loadYaml(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return parseDocument(fileContents);
}

function saveYaml(data, filePath) {
  const yamlString = stringify(data);
  fs.writeFileSync(filePath, yamlString, 'utf8');
}

const getPackagesToReleasePaths = async () => {
  const options = { dryRun: false, verbose: false };

  const { projectsVersionData } = await releaseVersion({
    // We don't want to update the package.json to have a dirty git state
    dryRun: true,
    verbose: options.verbose,
    projects: ['apps/my-app', 'apps/my-app-2', 'apps/my-app-3'],
    gitCommit: false,
    stageChanges: false,
    gitTag: true,
    generatorOptionsOverrides: {
      skipLockFileUpdate: true,
    }
  });


  const projectThatNeedsCi = Object.entries(projectsVersionData).filter(([projectName, versionData]) => {
    const { newVersion } = versionData;
    return newVersion;

  }).map(([projectName]) => {
    return projectName;
  });

  if (!projectThatNeedsCi.length) {
    return [];
  }
  const graph = await createProjectGraphAsync();

  return projectThatNeedsCi.map(projectName => {
    const project = graph.nodes[projectName];
    return project.data.root;
  });
}


(async () => {
  const projectThatNeedsCi =await getPackagesToReleasePaths();

  const base = loadYaml('./.circleci/base.yml');

  const yamlFromProject = projectThatNeedsCi.map(projectPath => {
    const configPath = path.join(workspaceRoot, projectPath, '.circleci.yml');
    try {
      return loadYaml(configPath);
    } catch (e) {
      return undefined;
    }
  }).filter(Boolean);


  for (let config of yamlFromProject) {
    const jobs = config.get('jobs').items;
    if (Array.isArray(jobs)) {
      base.addIn(['jobs'], ...jobs);
    } else {
      base.addIn(['jobs'], jobs);
    }

    const workflows = config.getIn(['workflows', 'docker_build_and_deploy', 'jobs']).items;
    if (Array.isArray(workflows)) {
      base.addIn(['workflows', 'docker_build_and_deploy', 'jobs'], ...workflows);
    } else {
      base.addIn(['workflows', 'docker_build_and_deploy', 'jobs'], workflows);
    }
  }

  saveYaml(base, 'generated-circle-ci.yaml');

  process.exit(0);
})();
