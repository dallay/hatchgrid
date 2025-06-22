package com.hatchgrid.thryve.form.application.delete

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * This service class is responsible for handling the deletion of forms.
 * It implements the CommandHandler interface with [DeleteFormCommand] as the command type.
 *
 * @property formDestroyer An instance of [FormDestroyer] used to delete the form.
 */
@Service
class DeleteFormCommandHandler(
    private val formDestroyer: FormDestroyer
) : CommandHandler<DeleteFormCommand> {

    /**
     * Handles the deletion of a form.
     * Logs the id of the form being deleted and calls the formDestroyer's delete method.
     *
     * @param command The command object containing the id of the form to be deleted.
     */
    override suspend fun handle(command: DeleteFormCommand) {
        log.debug("Deleting form with ids: {}, {}", command.workspaceId, command.formId)
        formDestroyer.delete(WorkspaceId(command.workspaceId), FormId(command.formId))
    }

    companion object {
        private val log = LoggerFactory.getLogger(DeleteFormCommandHandler::class.java)
    }
}
