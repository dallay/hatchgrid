package com.hatchgrid.thryve.workspace.application.update

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.workspace.domain.WorkspaceException
import com.hatchgrid.thryve.workspace.domain.WorkspaceNotFoundException
import io.r2dbc.spi.R2dbcException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataAccessException

/**
 * This class is responsible for handling the update workspace command.
 * It uses the [WorkspaceUpdater] service to perform the update operation.
 *
 * @property workspaceUpdater The service used to update the workspace.
 */
@Service
class UpdateWorkspaceCommandHandler(
    private val workspaceUpdater: WorkspaceUpdater
) : CommandHandler<UpdateWorkspaceCommand> {

    /**
     * This method handles the update workspace command.
     * It logs the operation and delegates the update operation to the [WorkspaceUpdater] service.
     *
     * @param command The [UpdateWorkspaceCommand] that triggers the update operation.
     */
    override suspend fun handle(command: UpdateWorkspaceCommand) {
        require(command.id.isNotBlank()) { "Workspace ID cannot be blank" }
        require(command.name.isNotBlank()) { "Workspace name cannot be blank" }

        log.debug("Updating workspace with id: ${command.id}")
        try {
            workspaceUpdater.update(command.id, command.name, command.description)
            log.info("Successfully updated workspace with id: ${command.id}")
        } catch (exception: WorkspaceNotFoundException) {
            log.error("Workspace not found with id: ${command.id}")
            throw exception
        } catch (exception: R2dbcException) {
            log.error("Database connection error while updating workspace with id: ${command.id}", exception)
            throw WorkspaceException("Database connection error", exception)
        } catch (exception: DataAccessException) {
            log.error("Failed to update workspace with id: ${command.id}", exception)
            throw WorkspaceException("Error updating workspace", exception)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateWorkspaceCommandHandler::class.java)
    }
}
