import * as core from '@actions/core'
import * as github from '@actions/github'

type DeploymentStatus = 
  'error' 
  | 'failure' 
  | 'inactive' 
  | 'in_progress' 
  | 'queued' 
  | 'pending' 
  | 'success'

const boolOpt = (val: string): boolean => {
  if (val === "true") {
    return true
  }
  if (val === "false") {
    return false
  }
  throw new Error(`Unexpected boolean value: ${val}`)
}


async function run(): Promise<void> {
  try {
    const context = github.context

    const token = core.getInput("token", {required: true})
    const deployment_id = parseInt(core.getInput("deployment_id", {required: true}), 10)
    const state = core.getInput("state", {required: true}) as DeploymentStatus
    const log_url = core.getInput("log_url", {required: false}) || ""
    const description = core.getInput("description", {required: false}) || ""
    const environment = core.getInput("environment", {required: false})
    const environment_url = core.getInput("environment_url", {required: false}) || ""
    const auto_inactive = boolOpt(core.getInput("auto_inactive", {required: false}) || "true")

    const client = new github.GitHub(token, {previews: ["flash", "ant-man"]})
    let request = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      deployment_id,
      state,
      log_url,
      description,
      environment_url,
      auto_inactive
    }
    if (environment.length) {
      request = Object.assign({}, request, {environment})
    }

    core.info("Updating deployment status...")
    core.debug(`Status params: ${JSON.stringify(request)}`)

    await client.repos.createDeploymentStatus(request)

    core.info("Successfully updated status")
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
