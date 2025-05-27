package com.hatchgrid.thryve.workspace.application.find.by.member

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.WorkspaceResponses
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import org.slf4j.LoggerFactory

/**
 * This service is responsible for finding all workspaces.
 *
 * @property finder The repository used to find all workspaces.
 */
@Service
class AllWorkspaceByMemberFinder(private val finder: WorkspaceFinderRepository) {

    /**
     * Finds all workspaces.
     * @param userId The unique identifier of the user.
     *
     * @throws Exception If an error occurs while finding all workspaces.
     * @return The [WorkspaceResponses] containing all workspaces.
     */
    suspend fun findAll(userId: String): WorkspaceResponses {
        log.debug("Finding all workspaces for user with id: $userId")
        val workspaces = finder.findByMemberId(UserId((userId)))
        return WorkspaceResponses.from(workspaces)
    }

    companion object {
        private val log = LoggerFactory.getLogger(AllWorkspaceByMemberFinder::class.java)
    }
}
