package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceCreatedEvent
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import org.slf4j.LoggerFactory

/**
 * WorkspaceCreator is a service class responsible for creating workspaces.
 * It uses a workspaceCreator to create a workspace and publishes a workspaceCreatedEvent
 * for each created workspace.
 *
 * @property workspaceRepository The WorkspaceCreator used to create workspaces.
 * @property eventPublisher The EventPublisher used to publish WorkspaceCreatedEvents.
 */
@Service
class WorkspaceCreator(
    private val workspaceRepository: WorkspaceRepository,
    eventPublisher: EventPublisher<WorkspaceCreatedEvent>
) {
    private val eventPublisher = EventBroadcaster<WorkspaceCreatedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    /**
     * Creates a workspace using the WorkspaceCreator and publishes a
     * [WorkspaceCreatedEvent] for the created workspace.
     *
     * @param workspace The workspace to be created.
     */
    suspend fun create(workspace: Workspace) {
        log.debug("Creating workspace with id: {}", workspace.id)
        workspaceRepository.create(workspace)
        val domainEvents = workspace.pullDomainEvents()
        domainEvents.forEach {
            eventPublisher.publish(it as WorkspaceCreatedEvent)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(WorkspaceCreator::class.java)
    }
}
