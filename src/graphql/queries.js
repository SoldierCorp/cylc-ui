/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Code related to GraphQL queries, fragments, variables, etc.

import gql from 'graphql-tag'
// eslint-disable-next-line no-unused-vars
import { DocumentNode } from 'graphql'

// IMPORTANT: queries here may be used in the offline mode to create mock data. Before removing or renaming
// queries here, please check under the services/mock folder for occurrences of the variable name.

/**
 * @type {DocumentNode}
 */
const WORKFLOW_TREE_DELTAS_SUBSCRIPTION = gql`
subscription OnWorkflowDeltasData ($workflowId: ID) {
  deltas (workflows: [$workflowId], stripNull: true) {
   ...WorkflowTreeDeltas
  }
}

# TREE DELTAS BEGIN

fragment WorkflowTreeDeltas on Deltas {
  id
  shutdown
  added {
    ...WorkflowTreeAddedData
  }
  updated {
    ...WorkflowTreeUpdatedData
  }
  pruned {
    ...WorkflowTreePrunedData
  }
}

fragment WorkflowTreeAddedData on Added {
  workflow {
    ...WorkflowData
    cyclePoints: familyProxies (ids: ["root"], ghosts: true) {
      ...CyclePointData
    }
    taskProxies (sort: { keys: ["name"], reverse: false }, ghosts: true) {
      ...TaskProxyData
      jobs(sort: { keys: ["submit_num"], reverse:true }) {
        ...JobData
      }
    }
    familyProxies (exids: ["root"], sort: { keys: ["name"] }, ghosts: true) {
      ...FamilyProxyData
    }
  }
  cyclePoints: familyProxies (ids: ["root"], ghosts: true) {
    ...CyclePointData
  }
  familyProxies (exids: ["root"], sort: { keys: ["name"] }, ghosts: true) {
    ...FamilyProxyData
  }
  taskProxies (sort: { keys: ["name"], reverse: false }, ghosts: true) {
    ...TaskProxyData
  }
  jobs (sort: { keys: ["submit_num"], reverse:true }) {
    ...JobData
  }
}

fragment WorkflowTreeUpdatedData on Updated {
  taskProxies (ghosts: true) {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
  familyProxies (exids: ["root"], ghosts: true) {
    ...FamilyProxyData
  }
}

fragment WorkflowTreePrunedData on Pruned {
  jobs
  taskProxies
  familyProxies
}

# TREE DELTAS END

# WORKFLOW DATA BEGIN

fragment WorkflowData on Workflow {
  id
  name
  status
  owner
  host
  port
}

fragment CyclePointData on FamilyProxy {
  id
  cyclePoint
}

fragment FamilyProxyData on FamilyProxy {
  id
  name
  state
  cyclePoint
  firstParent {
    id
    name
    cyclePoint
    state
  }
}

fragment TaskProxyData on TaskProxy {
  id
  name
  state
  isHeld
  cyclePoint
  latestMessage
  firstParent {
    id
    name
    cyclePoint
    state
  }
  task {
    meanElapsedTime
    name
  }
}

fragment JobData on Job {
  id
  firstParent: taskProxy {
    id
  }
  batchSysName
  batchSysJobId
  host
  startedTime
  submittedTime
  finishedTime
  state
  submitNum
}

# WORKFLOW DATA END
`

/**
 * Query used to retrieve data for a workflow Graph view.
 * @type {string}
 */
const WORKFLOW_GRAPH_QUERY = `
subscription ($workflowId: ID) {
  workflows(ids: ["WORKFLOW_ID"]) {
    id
    name
    status
    owner
    host
    port
    nodesEdges {
      nodes {
        id
        label: id
        parent: firstParent {
          id
          state
        }
        state
        cyclePoint
        task {
          name
        }
        jobs(sort: {keys: ["submit_num"], reverse: true}) {
          id
          batchSysName
          batchSysJobId
          host
          startedTime
          submittedTime
          finishedTime
          state
          submitNum
        }
      }
      edges {
        id
        source
        target
        label: id
      }
    }
    taskProxies(sort: { keys: ["cyclePoint"] }) {
      id
      state
      cyclePoint
      latestMessage
      firstParent {
        id
        name
        cyclePoint
        state
      }
      task {
        meanElapsedTime
        name
      }
      jobs(sort: { keys: ["submit_num"], reverse:true }) {
        id
        batchSysName
        batchSysJobId
        host
        startedTime
        submittedTime
        finishedTime
        state
        submitNum
      }
    }
    familyProxies (sort: { keys: ["firstParent"]}) {
      id
      name
      state
      cyclePoint
      firstParent {
        id
        name
        cyclePoint
        state
      }
    }
  }
}
`

/**
 * Query used to retrieve data for the application Dashboard.
 * @type {string}
 */
const DASHBOARD_QUERY = `
subscription {
  workflows {
    id
    name
    status
  }
}
`

/**
 * Query used to retrieve data for the GScan sidebar.
 * @type {DocumentNode}
 */
const GSCAN_QUERY = `
subscription {
  workflows {
    id
    name
    status
    owner
    host
    port
    taskProxies(sort: { keys: ["cyclePoint"] }) {
      id
      name
      state
      cyclePoint
      latestMessage
      task {
        meanElapsedTime
        name
      }
      jobs(sort: { keys: ["submit_num"], reverse:true }) {
        id
        batchSysName
        batchSysJobId
        host
        startedTime
        submittedTime
        finishedTime
        state
        submitNum
      }
    }
  }
}
`

/**
 * Subscription used in the view that lists workflows in a table.
 * @type {string}
 */
const WORKFLOWS_TABLE_QUERY = `
  subscription {
    workflows {
      id
      name
      owner
      host
      port
    }
  }
`

// TODO: remove these once the api-on-the-fly mutations are hooked into the UI
const HOLD_WORKFLOW = gql`
mutation HoldWorkflowMutation($workflow: WorkflowID!) {
  hold (workflows: [$workflow]) {
    result
  }
}
`

const RELEASE_WORKFLOW = gql`
mutation ReleaseWorkflowMutation($workflow: WorkflowID!) {
  release (workflows: [$workflow]){
    result
  }
}
`

const STOP_WORKFLOW = gql`
mutation StopWorkflowMutation($workflow: WorkflowID!) {
  stop (workflows: [$workflow]) {
    result
  }
}
`

export {
  HOLD_WORKFLOW,
  RELEASE_WORKFLOW,
  STOP_WORKFLOW,
  WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
  WORKFLOW_GRAPH_QUERY,
  DASHBOARD_QUERY,
  GSCAN_QUERY,
  WORKFLOWS_TABLE_QUERY
}
