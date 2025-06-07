package com.hatchgrid.thryve.newsletter.subscriber.application.search.active

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import com.hatchgrid.common.domain.Service
import org.slf4j.LoggerFactory

/**
 * Service for searching active subscribers.
 *
 * @property repository The repository for searching subscribers.
 * @created 10/1/24
 */
@Service
class ActiveSubscriberSearcher(private val repository: SubscriberSearchRepository) {

    /**
     * Searches for active subscribers and returns a response containing the list of active subscribers.
     *
     * @return SubscribersResponse containing the list of active subscribers.
     */
    suspend fun search(): SubscribersResponse {
        log.info("Searching active subscribers")
        val subscribers: List<Subscriber> = repository.searchActive()
        return SubscribersResponse(
            subscribers.map {
                SubscriberResponse(
                    it.id.toString(),
                    it.email.value,
                    it.name.fullName(),
                    it.status.name,
                    it.attributes,
                    it.workspaceId.toString(),
                    it.createdAt.toString(),
                    it.updatedAt?.toString(),
                )
            }.toList(),
        )
    }

    companion object {
        private val log = LoggerFactory.getLogger(ActiveSubscriberSearcher::class.java)
    }
}
