package com.hatchgrid.thryve.workspace.application.delete

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceDeletedEvent
import org.slf4j.LoggerFactory

/**
 * This service class is responsible for deleting workspaces.
 *
 * @property destroyer The repository that handles the deletion of workspaces.
 * @property eventPublisher The publisher that handles the broadcasting of workspace deletion events.
 */
@Service
class WorkspaceDestroyer(
    private val destroyer: WorkspaceRepository,
    eventPublisher: EventPublisher<WorkspaceDeletedEvent>
) {
    private val eventBroadcaster = EventBroadcaster<WorkspaceDeletedEvent>()

    init {
        this.eventBroadcaster.use(eventPublisher)
    }

    /**
     * Deletes a workspace with the given id.
     *
     * @param id The id of the workspace to be deleted.
     */
    suspend fun delete(id: WorkspaceId) {
        log.debug("Deleting workspace with id: {}", id)
        destroyer.delete(id)
        eventBroadcaster.publish(WorkspaceDeletedEvent(id.value.toString()))
    }

    companion object {
        private val log = LoggerFactory.getLogger(WorkspaceDestroyer::class.java)
    }
}
