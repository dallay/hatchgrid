package com.hatchgrid.thryve.newsletter.tag.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTag
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagId
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.SubscriberTaggedEvent
import java.util.UUID
import org.slf4j.LoggerFactory

@Service
class SubscriberTagCreator(
    private val subscriberTagRepository: SubscriberTagRepository,
    eventPublisher: EventPublisher<SubscriberTaggedEvent>
) {
    private val eventPublisher = EventBroadcaster<SubscriberTaggedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    suspend fun create(
        subscriberId: UUID,
        tagId: UUID
    ) {
        log.debug("Tagging subscriber with id {} with tag id {}", subscriberId, tagId)
        val subscriberTag = SubscriberTag.Companion.create(
            SubscriberTagId.Companion.create(subscriberId, tagId),
        )
        subscriberTagRepository.create(subscriberTag)
        val domainEvents = subscriberTag.pullDomainEvents()
        domainEvents.forEach { eventPublisher.publish(it as SubscriberTaggedEvent) }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberTagCreator::class.java)
    }
}
