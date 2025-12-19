const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // Get inputs
    const token = core.getInput('github-token', { required: true });
    const includeCollaborators = core.getInput('include-collaborators') === 'true';
    
    // Create Octokit instance
    const octokit = github.getOctokit(token);
    
    // Get repository information
    const { owner, repo } = github.context.repo;
    
    core.info(`Fetching info for ${owner}/${repo}`);
    
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo
    });
    
    // Set outputs
    core.setOutput('repo-name', repoData.full_name);
    core.setOutput('stars', repoData.stargazers_count);
    core.setOutput('open-issues', repoData.open_issues_count);
    
    // Log information
    core.info(`Stars: ${repoData.stargazers_count}`);
    core.info(`Open Issues: ${repoData.open_issues_count}`);
    core.info(`Watchers: ${repoData.watchers_count}`);
    
    if (includeCollaborators) {
      const { data: collaborators } = await octokit.rest.repos.listCollaborators({
        owner,
        repo
      });
      core.info(`Collaborators: ${collaborators.length}`);
    }
    
    // Create summary
    core.summary
      .addHeading('Repository Information')
      .addTable([
        [{data: 'Metric', header: true}, {data: 'Value', header: true}],
        ['Repository', repoData.full_name],
        ['Stars', repoData.stargazers_count.toString()],
        ['Open Issues', repoData.open_issues_count.toString()],
        ['Forks', repoData.forks_count.toString()]
      ])
      .write();
    
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
