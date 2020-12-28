import * as core from "@actions/core";
import * as github from "@actions/github";

import { generate } from "../src/lib/reporters/markdown";
import getCoverage from "../src/lib/getCoverage";
import { getCurrentCommitSha, updateCheckRun } from "./utils"

const CHECK_NAME = "Typescript Coverage Report";

export const run = async (): Promise<void> => {
  core.info(`Typescript Coverage Reporter started`);

  const ref = process.env.GITHUB_SHA;
  const commitSha = getCurrentCommitSha();

  core.info(`Ref: ${ref}`);
  core.info(`Commit SHA: ${commitSha}`);

  /**
   * env:
   *   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   */
  const token = core.getInput("github-token") || process.env.GITHUB_TOKEN;
  const checkName = core.getInput("name") || CHECK_NAME;

  if (!token) {
    return core.setFailed("Github Token is missing");
  }

  const octokit = github.getOctokit(token);

  // repo
  const { owner, repo } = github.context.repo;

  core.info(`Creating a check named "${checkName}"`);

  const check = await octokit.checks.create({
    owner,
    repo,
    name: checkName,
    // eslint-disable-next-line @typescript-eslint/camelcase
    head_sha: commitSha,
    status: "in_progress"
  });

  const checkId = check.data.id;

  core.info(`Check ID: ${checkId}`);

  const coverageResult = await getCoverage();
  const markdownReport = generate(coverageResult, 90);

  updateCheckRun(octokit, checkId, {
    conclusion: "success",
    output: {
      title: "Typescript Coverage Report",
      summary: `**Typescript Coverage Percentage**: ${coverageResult.percentage.toFixed(2)}%`,
      text: markdownReport
    }
  });
};
