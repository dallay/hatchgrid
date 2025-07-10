package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.command.CommandHandlerExecutionError
import com.hatchgrid.common.domain.bus.event.EventConsumer
import com.hatchgrid.common.domain.bus.event.Subscribe
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.application.create.CreateWorkspaceCommand
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.*

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
        log.info("Processing user creation event for user: {}", event.userId)
        
        try {
            val userId = UserId(event.userId)
            val existingWorkspaces = workspaceFinderRepository.findByOwnerId(userId)
            
            if (existingWorkspaces.isNotEmpty()) {
                log.info(
                    "User {} already has {} workspace(s), skipping default workspace creation",
                    event.userId,
                    existingWorkspaces.size
                )
                return
            }
            
            log.info("Creating default workspace for user: {}", event.userId)
            val workspaceId = UUID.randomUUID().toString()
            val workspaceName = generateDefaultWorkspaceName(event.firstname, event.lastname)
            
            val createWorkspaceCommand = CreateWorkspaceCommand(
                id = workspaceId,
                name = workspaceName,
                description = "Default workspace created automatically upon user registration",
                ownerId = event.userId
            )
            
            // TODO: Add isPrimary field support when it's available in the domain model
            // The requirements mention flagging the workspace as primary, but this field
            // doesn't exist in the current Workspace entity or database schema
            
            mediator.send(createWorkspaceCommand)
            log.info(
                "Successfully created default workspace '{}' with id {} for user: {}",
                workspaceName,
                workspaceId,
                event.userId
            )
            
        } catch (e: CommandHandlerExecutionError) {
            log.error(
                "Failed to create default workspace for user: {} due to command execution error. " +
                "User account will remain valid but without a workspace.", 
                event.userId, 
                e
            )
            // Note: We don't re-throw the exception to avoid disrupting the user registration flow
            // The user can still use the system and create a workspace manually later
            
        } catch (e: Exception) {
            log.error(
                "Unexpected error while creating default workspace for user: {}. " +
                "User account will remain valid but without a workspace.", 
                event.userId, 
                e
            )
            // Note: We don't re-throw the exception to avoid disrupting the user registration flow
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
    }
}