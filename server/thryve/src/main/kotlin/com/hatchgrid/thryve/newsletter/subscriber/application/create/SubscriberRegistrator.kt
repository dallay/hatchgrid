package com.hatchgrid.thryve.newsletter.subscriber.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberRepository
import com.hatchgrid.thryve.newsletter.subscriber.domain.event.SubscriberCreatedEvent
import java.util.*
import org.slf4j.LoggerFactory

/**
 * Service class responsible for registering subscribers.
 *
 * @property subscriberRepository The repository for managing subscribers.
 * @property eventPublisher The publisher for broadcasting domain events.
 */
@Service
class SubscriberRegistrator(
    private val subscriberRepository: SubscriberRepository,
    eventPublisher: EventPublisher<SubscriberCreatedEvent>
) {
    private val eventPublisher = EventBroadcaster<SubscriberCreatedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    /**
     * Function to register a new subscriber.
     *
     * @param id The unique identifier of the subscriber.
     * @param email The email address of the subscriber.
     * @param firstName The first name of the subscriber.
     * @param lastName The last name of the subscriber. This can be null.
     * @param attributes Additional attributes associated with the subscriber.
     * @param workspaceId The identifier of the workspace the subscriber belongs to.
     */
    suspend fun register(
        id: UUID,
        email: String,
        firstName: String? = null,
        lastName: String? = null,
        attributes: Attributes?,
        workspaceId: UUID
    ) {
        log.debug("Registering subscriber with email: $email")

        val subscriber = Subscriber.create(
            id,
            email,
            firstName,
            lastName,
            attributes = attributes,
            workspaceId = workspaceId,
        )
        subscriberRepository.create(subscriber)
        val domainEvents = subscriber.pullDomainEvents()

        domainEvents.forEach {
            eventPublisher.publish(it as SubscriberCreatedEvent)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberRegistrator::class.java)
    }
}
