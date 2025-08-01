package com.hatchgrid.thryve.newsletter.subscriber.application.search.all

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.pagination.TimestampCursor
import com.hatchgrid.common.domain.presentation.pagination.map
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import org.slf4j.LoggerFactory

/**
 * This class represents a service to search all subscribers.
 *
 * @property repository The [SubscriberSearchRepository] to fetch subscribers from.
 */
@Service
class SearchAllSubscriberSearcher(private val repository: SubscriberSearchRepository) {

    /**
     * Searches for subscribers based on the given criteria, size, cursor, and sort.
     *
     * @param criteria The criteria to filter the subscribers. It can be null.
     * @param size The size of the page to return. It can be null.
     * @param cursor The cursor to paginate through the subscribers. It can be null.
     * @param sort The sort order for the subscribers. It can be null.
     * @return A page of subscribers that match the given criteria, size, cursor, and sort.
     */
    suspend fun search(
        criteria: Criteria?,
        size: Int?,
        cursor: String?,
        sort: Sort?
    ): CursorPageResponse<SubscriberResponse> {
        log.debug(
            "Searching all subscribers with criteria: {}, size: {}, cursor: {}, sort: {}",
            criteria,
            size,
            cursor,
            sort,
        )
        val timestampCursor = cursor?.let { TimestampCursor.deserialize(it) }
        return repository.searchAllByCursor(criteria, size, sort, timestampCursor).map { pageResponse ->
            pageResponse.map { SubscriberResponse.from(it) }
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SearchAllSubscriberSearcher::class.java)
    }
}
