import * as github from "@actions/github";
import * as core from "@actions/core";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { execSync } from "child_process";

function getCurrentCommitSha() {
    const sha = execSync(`git rev-parse HEAD`).toString().trim();

    try {
        const msg = execSync(`git show ${sha} -s --format=%s`).toString().trim();
        const PR_MSG = /Merge (\w+) into \w+/i;

        if (PR_MSG.test(msg)) {
            const result = PR_MSG.exec(msg);

            if (result) {
                return result[1];
            }
        }
    } catch (e) {
        //
    }
    return sha;
}


type OctokitInstance = ReturnType<typeof github.getOctokit>;

type UpdateCheckRunOptions = Required<
    Pick<
        RestEndpointMethodTypes["checks"]["update"]["parameters"],
        "conclusion" | "output"
    >
>;

async function updateCheckRun(
    octokit: OctokitInstance,
    checkId: number,
    { conclusion, output }: UpdateCheckRunOptions
) {
    core.info(`Updating check: ${checkId}`);
    await octokit.checks.update({
        // eslint-disable-next-line @typescript-eslint/camelcase
        check_run_id: checkId,
        // eslint-disable-next-line @typescript-eslint/camelcase
        completed_at: new Date().toISOString(),
        status: "completed",
        ...github.context.repo,
        conclusion,
        output
    });

    // Fail
    if (conclusion === "failure") {
        return core.setFailed(output.title!);
    }
}

export { getCurrentCommitSha, updateCheckRun }