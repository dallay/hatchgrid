package com.hatchgrid.thryve.form.application.update

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.form.domain.FormConfiguration
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * Service class responsible for handling form update commands.
 *
 * @property workspaceAuthorizationService The service for checking workspace access permissions.
 * @property formUpdater The service for updating forms.
 */
@Service
class UpdateFormCommandHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val formUpdater: FormUpdater
) : CommandHandler<UpdateFormCommand> {

    /**
     * Handles a form update command.
     * Logs the name of the form being updated, creates a FormDTO from the command, and calls the form updater service.
     *
     * @param command The form update command to handle.
     */
    override suspend fun handle(command: UpdateFormCommand) {
        log.debug("Updating form with name: ${command.name}")
        val formStyleConfiguration = FormConfiguration(
            name = command.name,
            header = command.header,
            description = command.description,
            inputPlaceholder = command.inputPlaceholder,
            buttonText = command.buttonText,
            buttonColor = command.buttonColor,
            backgroundColor = command.backgroundColor,
            textColor = command.textColor,
            buttonTextColor = command.buttonTextColor,
        )
        workspaceAuthorizationService.ensureAccess(command.workspaceId, command.userId)
        formUpdater.update(
            WorkspaceId(command.workspaceId),
            FormId(command.id), formStyleConfiguration,
        )
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateFormCommandHandler::class.java)
    }
}
