package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
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
        log.debug("Creating workspace with name: ${command.name}")
        val workspace = Workspace.create(
            id = UUID.fromString(command.id),
            name = command.name,
            description = command.description,
            ownerId = UUID.fromString(command.ownerId),
        )
        workspaceCreator.create(workspace)
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateWorkspaceCommandHandler::class.java)
    }
}
