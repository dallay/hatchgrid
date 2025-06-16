package com.hatchgrid.thryve.newsletter.tag.application.update

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.thryve.newsletter.subscriber.application.search.email.GetAllSubscribersByEmailService
import com.hatchgrid.thryve.newsletter.tag.application.create.SubscriberTagCreator
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTag
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagId
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.TagSearchRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagSubscriberDeletedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagSubscriberUpdatedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagUpdatedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.exceptions.TagNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.common.domain.vo.email.Email
import java.util.UUID
import org.slf4j.LoggerFactory

/**
 * Service responsible for updating a tag and handling subscribers associated with the tag.
 *
 * @param tagRepository Repository for updating the tag entity.
 * @param tagSearchRepository Repository for finding the tag entity.
 * @param allSubscribersByEmailService Service to fetch subscribers by email.
 * @param subscriberTagCreator Service to create subscriber tags.
 * @param subscriberTagRepository Repository for managing subscriber tags.
 * @param eventPublisher Event publisher for broadcasting domain events.
 */
@Service
class TagUpdater(
    private val tagRepository: TagRepository,
    private val tagSearchRepository: TagSearchRepository,
    private val allSubscribersByEmailService: GetAllSubscribersByEmailService,
    private val subscriberTagCreator: SubscriberTagCreator,
    private val subscriberTagRepository: SubscriberTagRepository,
    eventPublisher: EventPublisher<TagUpdatedEvent>
) {
    private val eventPublisher = EventBroadcaster<TagUpdatedEvent>().apply {
        use(eventPublisher)
    }

    /**
     * Updates a tag's name, color, and subscribers list.
     *
     * @param id Tag ID to be updated.
     * @param name New name for the tag (optional).
     * @param color New color for the tag (optional).
     * @param workspaceId Workspace ID associated with the tag.
     * @param subscribers Set of subscriber emails to update the tag with (optional).
     */
    suspend fun update(
        id: UUID,
        name: String?,
        color: TagColor?,
        workspaceId: UUID,
        subscribers: Set<String>?
    ) {
        log.debug("Updating tag with id {} and name {} for workspace {}", id, name, workspaceId)
        val tag = tagSearchRepository.findById(WorkspaceId(workspaceId), TagId(id))
        if (tag == null) {
            log.warn("Tag with id {} not found for workspace {}", id, workspaceId)
            throw TagNotFoundException("Tag with id $id not found for workspace $workspaceId")
        }
        val subscriberEmails = subscribers?.map(::Email)?.toMutableSet() ?: mutableSetOf()

        tag.update(name, color)
        tagRepository.update(tag)
        eventPublisher.publish(tag.pullDomainEvents().map { it as TagUpdatedEvent })

        val currentSubscribers = tag.subscribers ?: mutableSetOf()
        handleSubscribers(tag, currentSubscribers, subscriberEmails, workspaceId, id)
    }

    /**
     * Handles adding and removing subscribers from the tag.
     */
    private suspend fun handleSubscribers(
        tag: Tag,
        currentSubscribers: Set<Email>,
        newSubscribers: Set<Email>,
        workspaceId: UUID,
        tagId: UUID
    ) {
        val subscribersToAdd = newSubscribers - currentSubscribers
        if (subscribersToAdd.isNotEmpty()) {
            createSubscribersWithTag(subscribersToAdd, workspaceId, tagId)
            tag.addSubscriberEmails(subscribersToAdd)
            eventPublisher.publish(tag.pullDomainEvents().map { it as TagSubscriberUpdatedEvent })
        }

        val subscribersToRemove = currentSubscribers - newSubscribers
        if (subscribersToRemove.isNotEmpty()) {
            deleteSubscribersWithTag(subscribersToRemove, workspaceId, tagId)
            tag.removeSubscriberEmails(subscribersToRemove)
            eventPublisher.publish(tag.pullDomainEvents().map { it as TagSubscriberDeletedEvent })
        }
    }

    /**
     * Adds new subscribers to the tag.
     */
    private suspend fun createSubscribersWithTag(
        subscribersToAdd: Set<Email>,
        workspaceId: UUID,
        id: UUID
    ) {
        val subscriberByEmails = allSubscribersByEmailService.searchAllByEmails(
            workspaceId.toString(),
            subscribersToAdd.map(Email::value).toSet(),
        )
        toSubscriberTags(subscriberByEmails, id)?.forEach {
            subscriberTagCreator.create(it.id.value.first, it.id.value.second)
        }
    }

    /**
     * Removes subscribers from the tag.
     */
    private suspend fun deleteSubscribersWithTag(
        subscribersToRemove: Set<Email>,
        workspaceId: UUID,
        id: UUID
    ) {
        val subscriberByEmails = allSubscribersByEmailService.searchAllByEmails(
            workspaceId.toString(),
            subscribersToRemove.map(Email::value).toSet(),
        )
        toSubscriberTags(subscriberByEmails, id)?.forEach { subscriberTag ->
            subscriberTagRepository.delete(subscriberTag)
        }
    }

    /**
     * Maps the subscribers response to a set of SubscriberTag entities.
     */
    private fun toSubscriberTags(
        response: SubscribersResponse?,
        tagId: UUID
    ): Set<SubscriberTag>? {
        return response?.subscribers?.map {
            SubscriberTag(SubscriberTagId.create(UUID.fromString(it.id), tagId))
        }?.toSet()
    }

    companion object {
        private val log = LoggerFactory.getLogger(TagUpdater::class.java)
    }
}
