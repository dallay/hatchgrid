package com.hatchgrid.common.domain.bus.query

/**
 * Interface to be implemented for a non-blocking query handler
 *
 * @since 1.0.0
 * @param TQuery any [Query] subclass to handle
 * @see Query
 */
fun interface QueryHandler<TQuery : Query<TResponse>, TResponse> {
    /**
     * Handles a query
     *
     * @param query the query to handle
     */
    suspend fun handle(query: TQuery): TResponse
}
