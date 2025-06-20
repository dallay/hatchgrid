package com.hatchgrid.thryve.workspace.application.find

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * This is a service class that handles the finding of workspaces.
 * It uses a [WorkspaceFinderRepository] to find a workspace by its ID.
 *
 * @property finder [WorkspaceFinderRepository] The repository to use for finding workspaces.
 */
@Service
class WorkspaceFinder(private val finder: WorkspaceFinderRepository) {

    /**
     * This function is used to find a workspace by its ID.
     * It is a suspending function, meaning it can be paused and resumed at a later time.
     * This makes it suitable for use in a coroutine context, where it can be used for non-blocking IO operations.
     *
     * @param id The ID of the workspace to find.
     * @return The workspace found, or null if no workspace was found with the given ID.
     */
    suspend fun find(id: WorkspaceId) = finder.findById(id)
}
