package com.hatchgrid.thryve.newsletter.tag.application.update

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import java.util.*
import org.slf4j.LoggerFactory

/**
 * Command handler for updating an existing tag in a workspace.
 *
 * This handler processes the `UpdateTagCommand`, ensuring that the user has access to the workspace
 * and then updating the tag with the provided details.
 * @property workspaceAuthorizationService The service for checking workspace access permissions.
 * @property tagUpdater The service responsible for updating tags.
 * @created 22/9/24
 */
@Service
class UpdateTagCommandHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val tagUpdater: TagUpdater
) : CommandHandler<UpdateTagCommand> {
    override suspend fun handle(command: UpdateTagCommand) {
        log.debug(
            "Updating tag with id {} and name {} for workspace {}",
            command.id,
            command.name,
            command.workspaceId,
        )
        val tagId = UUID.fromString(command.id)
        val color = command.color?.let { TagColor.fromString(it) }
        val workspaceId = UUID.fromString(command.workspaceId)
        workspaceAuthorizationService.ensureAccess(command.workspaceId, command.userId)
        tagUpdater.update(tagId, command.name, color, workspaceId, command.subscribers)
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateTagCommandHandler::class.java)
    }
}
