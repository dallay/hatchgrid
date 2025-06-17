package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceException
import java.util.*
import org.slf4j.LoggerFactory

/**
 * [CreateWorkspaceCommandHandler] is a class responsible for handling the creation of workspace.
 * It implements the [CommandHandler] interface with [CreateWorkspaceCommand] as the command type.
 *
 * @property workspaceCreator The [WorkspaceCreator] used to create workspace.
 */
@Service
class CreateWorkspaceCommandHandler(
    private val workspaceCreator: WorkspaceCreator
) : CommandHandler<CreateWorkspaceCommand> {

    /**
     * Handles the creation of a workspace.
     * It logs the creation process, creates a new workspace using the [WorkspaceCreator],
     * and then creates the workspace.
     *
     * @param command The [CreateWorkspaceCommand] containing the information needed to create a workspace.
     */
    override suspend fun handle(command: CreateWorkspaceCommand) {
        require(command.name.isNotBlank()) { "Workspace name cannot be blank" }

        log.debug("Creating workspace with name: ${command.name}")
        try {
            val workspaceId = UUID.fromString(command.id)
            val ownerId = UUID.fromString(command.ownerId)

            val workspace = Workspace.create(
                id = workspaceId,
                name = command.name,
                description = command.description,
                ownerId = ownerId,
            )
            workspaceCreator.create(workspace)
            log.info("Successfully created workspace with id: ${command.id}")
        } catch (exception: IllegalArgumentException) {
            log.error("Invalid UUID format in create workspace command: ${exception.message}")
            throw IllegalArgumentException("Invalid workspace or owner ID format", exception)
        } catch (exception: Exception) {
            log.error("Failed to create workspace with name: ${command.name}", exception)
            throw WorkspaceException("Error creating workspace", exception)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateWorkspaceCommandHandler::class.java)
    }
}
