import * as github from "@actions/github";

export const printReportPR = async (reportBody, context, githubToken) => {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const issue_number = context.issue.number;

    const octokit = github.getOctokit("${{ secrets.GITHUB_TOKEN }}");

    const { data: comments } = await octokit.rest.issues.listComments({ owner, repo, issue_number })

    const comment = comments.find(comment => comment.user.login === "github-actions[bot]" && comment.body.includes("SonarQube Report"))

    if (comment) {
        await octokit.rest.issues.updateComment({ owner, repo, issue_number, comment_id: comment.id, body: reportBody })
    } else {
        await octokit.rest.issues.createComment({ owner, repo, issue_number, body: reportBody })
    }
}
