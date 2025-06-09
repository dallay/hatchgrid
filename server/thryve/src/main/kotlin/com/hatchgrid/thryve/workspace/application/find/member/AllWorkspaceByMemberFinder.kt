package com.hatchgrid.thryve.workspace.application.find.member

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.users.domain.UserId  // Fixed import path
import com.hatchgrid.thryve.workspace.application.WorkspaceResponses
import com.hatchgrid.thryve.workspace.domain.WorkspaceException
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import io.r2dbc.spi.R2dbcException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataAccessException

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
     * @throws WorkspaceException If a database error occurs while finding workspaces
     * @throws R2dbcException If there are connection issues with the database
     * @throws IllegalArgumentException If the userId is blank
     * @return The [WorkspaceResponses] containing all workspaces.
     */
    suspend fun findAll(userId: String): WorkspaceResponses {
        require(userId.isNotBlank()) { "User ID cannot be blank" }
        log.debug("Finding all workspaces for user with id: $userId")
        try {
            val workspaces = finder.findByMemberId(UserId(userId))
            return WorkspaceResponses.from(workspaces)
        } catch (exception: R2dbcException) {
            log.error("Database connection error while finding workspaces for user: $userId", exception)
            throw exception
        } catch (exception: DataAccessException) {
            log.error("Failed to find workspaces for user: $userId", exception)
            throw WorkspaceException("Error retrieving workspaces", exception)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(AllWorkspaceByMemberFinder::class.java)
    }
}
