package com.hatchgrid.thryve.form.application.search

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.thryve.form.application.FormResponse
import org.slf4j.LoggerFactory

/**
 * This class represents a query handler to search all forms.
 *
 * @property searcher The [FormsSearcher] to search forms.
 */
@Service
class SearchFormsQueryHandler(
    private val searcher: FormsSearcher,
) : QueryHandler<SearchFormsQuery, CursorPageResponse<FormResponse>> {

    /**
     * Handles the given query.
     *
     * @param query The query to handle.
     * @return A CursorPageResponse containing the search results.
     */
    override suspend fun handle(query: SearchFormsQuery): CursorPageResponse<FormResponse> {
        log.info("Searching all forms")
        return searcher.search(query.criteria, query.size, query.cursor, query.sort)
    }
    companion object {
        private val log = LoggerFactory.getLogger(SearchFormsQueryHandler::class.java)
    }
}
