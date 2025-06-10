package com.hatchgrid.thryve.authentication.application

import com.hatchgrid.thryve.authentication.application.query.RefreshTokenQuery
import com.hatchgrid.thryve.authentication.domain.AccessToken
import com.hatchgrid.thryve.authentication.domain.RefreshToken
import com.hatchgrid.thryve.authentication.domain.RefreshTokenManager
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import org.slf4j.LoggerFactory

/**
 * Class for handling a RefreshTokenQuery and returning an AccessToken.
 *
 * @property refreshTokenManager The manager for refreshing tokens.
 */
@Service
class RefreshTokenQueryHandler(private val refreshTokenManager: RefreshTokenManager) :
    QueryHandler<RefreshTokenQuery, AccessToken> {

    /**
     * Handles the given query.
     * @param query The query to handle.
     * @return The response of the query.
     */
    override suspend fun handle(query: RefreshTokenQuery): AccessToken {
        log.debug("Handling query: {}", query)
        return refreshTokenManager.refresh(RefreshToken(query.refreshToken))
    }
    companion object {
        private val log = LoggerFactory.getLogger(RefreshTokenQueryHandler::class.java)
    }
}
