package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.command.CommandHandlerExecutionError
import com.hatchgrid.common.domain.bus.event.EventConsumer
import com.hatchgrid.common.domain.bus.event.Subscribe
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.application.create.CreateWorkspaceCommand
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import io.r2dbc.spi.R2dbcException
import java.util.*
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException

/**
 * Event consumer that automatically creates a default workspace when a new user is created.
 *
 * This component listens to UserCreatedEvent and creates a default workspace for the user
 * if they don't already have any workspaces. This ensures that every user has a workspace
 * to work with from the moment they register.
 *
 * @property workspaceFinderRepository Repository to check for existing workspaces
 * @property mediator Mediator to dispatch CreateWorkspaceCommand
 */
@Component
@Subscribe(filterBy = UserCreatedEvent::class)
class CreateDefaultWorkspaceOnUserCreation(
    private val workspaceFinderRepository: WorkspaceFinderRepository,
    private val mediator: Mediator
) : EventConsumer<UserCreatedEvent> {

    /**
     * Handles UserCreatedEvent by creating a default workspace if the user doesn't have any.
     *
     * @param event The UserCreatedEvent containing user information
     */
    override suspend fun consume(event: UserCreatedEvent) {
        log.debug("Processing user creation event for user: {}", event.id)

        try {
            val userId = UserId(event.id)
            val existingWorkspaces = workspaceFinderRepository.findByOwnerId(userId)

            if (existingWorkspaces.isNotEmpty()) {
                log.debug(
                    "User {} already has {} workspace(s), skipping default workspace creation",
                    event.id,
                    existingWorkspaces.size,
                )
                return
            }

            log.debug("Creating default workspace for user: {}", event.id)
            val workspaceId = UUID.randomUUID().toString()
            val workspaceName = generateDefaultWorkspaceName(event.firstname, event.lastname)

            val createWorkspaceCommand = CreateWorkspaceCommand(
                id = workspaceId,
                name = workspaceName,
                description = "Default workspace created automatically upon user registration",
                ownerId = event.id,
            )

            mediator.send(createWorkspaceCommand)
            log.debug(
                "Successfully created default workspace '{}' with id {} for user: {}",
                workspaceName,
                workspaceId,
                event.id,
            )
        } catch (e: CommandHandlerExecutionError) {
            log.error(
                "Failed to create default workspace for user: {} due to command execution error. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        } catch (e: ResponseStatusException) {
            log.error(
                "Failed to create default workspace for user: {} due to validation error. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        } catch (e: IllegalArgumentException) {
            log.error(
                "Failed to create default workspace for user: {} due to invalid input. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        } catch (e: DataIntegrityViolationException) {
            log.error(
                "Failed to create default workspace for user: {} due to data integrity " +
                    "violation. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        } catch (e: R2dbcException) {
            log.error(
                "Failed to create default workspace for user: {} due to database error. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        } catch (@SuppressWarnings("TooGenericExceptionCaught") e: Exception) {
            // Catch any unexpected exceptions to ensure the user account remains valid
            // and tests expecting graceful handling do not fail due to uncaught exceptions.
            log.error(
                "Failed to create default workspace for user: {} due to unexpected error. $NO_WORKSPACE_MESSAGE",
                event.id,
                e,
            )
        }
    }

    /**
     * Generates a default workspace name based on user information.
     *
     * @param firstname User's first name (optional)
     * @param lastname User's last name (optional)
     * @return Generated workspace name
     */
    private fun generateDefaultWorkspaceName(firstname: String?, lastname: String?): String {
        return when {
            !firstname.isNullOrBlank() && !lastname.isNullOrBlank() ->
                "${firstname.trim()} ${lastname.trim()}'s Workspace"
            !firstname.isNullOrBlank() ->
                "${firstname.trim()}'s Workspace"
            !lastname.isNullOrBlank() ->
                "${lastname.trim()}'s Workspace"
            else ->
                "My Workspace"
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateDefaultWorkspaceOnUserCreation::class.java)
        private const val NO_WORKSPACE_MESSAGE = "User account will remain valid but without a workspace."
    }
}
