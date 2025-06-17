package com.hatchgrid.thryve.newsletter.tag.application.create

import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import java.util.UUID
import org.slf4j.LoggerFactory

/**
 * Command handler for creating a new tag.
 *
 * @property workspaceAuthorizationService The service for checking workspace access permissions.
 * @property tagCreator The service responsible for creating tags.
 */
@Service
class CreateTagCommandHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val tagCreator: TagCreator
) : CommandHandler<CreateTagCommand> {

    /**
     * Handles the CreateTagCommand to create a new tag.
     *
     * @param command The command containing the tag details.
     */
    override suspend fun handle(command: CreateTagCommand) {
        log.debug(
            "Creating tag with id {} and name {} for workspace {}",
            command.id,
            command.name,
            command.workspaceId,
        )

        workspaceAuthorizationService.ensureAccess(command.workspaceId, command.userId)
        val tagId = UUID.fromString(command.id)
        val color = TagColor.fromString(command.color)
        val workspaceId = UUID.fromString(command.workspaceId)
        tagCreator.create(tagId, command.name, color, workspaceId, command.subscribers)
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateTagCommandHandler::class.java)
    }
}
