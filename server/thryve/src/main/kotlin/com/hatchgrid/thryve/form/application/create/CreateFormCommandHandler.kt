package com.hatchgrid.thryve.form.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.dto.FormConfiguration
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import java.util.*
import org.slf4j.LoggerFactory

/**
 * Handles the creation of forms.
 *
 * @property workspaceAuthorizationService Service for checking workspace access permissions.
 * @property formCreator Service responsible for creating forms.
 */
@Service
class CreateFormCommandHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val formCreator: FormCreator
) : CommandHandler<CreateFormCommand> {

    /**
     * Handles the CreateFormCommand.
     *
     * It creates a form from the command and uses the formCreator to create the form.
     *
     * @param command The command to handle.
     */
    override suspend fun handle(command: CreateFormCommand) {
        log.debug("Creating form with name: ${command.name}")
        val formId = UUID.fromString(command.id)
        val workspaceId = UUID.fromString(command.workspaceId)

        workspaceAuthorizationService.ensureAccess(command.workspaceId, command.userId)

        val formConfiguration = FormConfiguration(
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

        val form = Form.create(
            id = formId,
            formConfiguration = formConfiguration,
            workspaceId = workspaceId,
        )

        formCreator.create(form)
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateFormCommandHandler::class.java)
    }
}
