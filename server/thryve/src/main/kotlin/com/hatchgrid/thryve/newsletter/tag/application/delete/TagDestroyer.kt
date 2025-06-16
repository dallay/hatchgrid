package com.hatchgrid.thryve.newsletter.tag.application.delete

import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.DeleteTagEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import org.slf4j.LoggerFactory

/**
 * Service class responsible for deleting tags.
 *
 * @property tagRepository The repository used to manage Tag entities.
 */
@Service
class TagDestroyer(
    private val tagRepository: TagRepository,
    eventPublisher: EventPublisher<DeleteTagEvent>
) {

    private val eventPublisher = EventBroadcaster<DeleteTagEvent>().apply {
        use(eventPublisher)
    }

    /**
     * Deletes a tag from the repository.
     *
     * @param workspaceId The ID of the workspace to which the tag belongs.
     * @param tagId The ID of the Tag entity to be deleted.
     */
    suspend fun delete(workspaceId: WorkspaceId, tagId: TagId) {
        log.debug("Deleting tag with id {} for workspace {}", tagId.value, workspaceId.value)
        tagRepository.delete(workspaceId, tagId)
        eventPublisher.publish(
            DeleteTagEvent(
                workspaceId.value.toString(),
                tagId.value.toString(),
            ),
        )
    }

    companion object {
        private val log = LoggerFactory.getLogger(TagDestroyer::class.java)
    }
}
