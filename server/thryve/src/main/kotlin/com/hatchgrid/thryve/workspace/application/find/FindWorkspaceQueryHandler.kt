package com.hatchgrid.thryve.workspace.application.find

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.workspace.application.WorkspaceResponse
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceNotFoundException
import org.slf4j.LoggerFactory

/**
 * Service class responsible for handling workspace find queries.
 *
 * @property finder [WorkspaceFinder] The service for finding workspaces.
 */
@Service
class FindWorkspaceQueryHandler(
    private val finder: WorkspaceFinder
) : QueryHandler<FindWorkspaceQuery, WorkspaceResponse> {

    /**
     * Handles a workspace find query.
     * Logs the id of the workspace being found, finds the workspace using the finder service,
     * and returns a [WorkspaceResponse].
     * If the workspace is not found, a [WorkspaceNotFoundException] is thrown.
     *
     * @param query The workspace find query to handle.
     * @return The [WorkspaceResponse] for the found workspace.
     * @throws [WorkspaceNotFoundException] If the workspace is not found.
     */
    override suspend fun handle(query: FindWorkspaceQuery): WorkspaceResponse {
        log.info("Finding workspace with id: ${query.id}")
        val workspaceId = WorkspaceId(query.id)
        val workspace = finder.find(workspaceId) ?: throw WorkspaceNotFoundException("Workspace not found")
        return WorkspaceResponse.from(workspace)
    }

    companion object {
        private val log = LoggerFactory.getLogger(FindWorkspaceQueryHandler::class.java)
    }
}
