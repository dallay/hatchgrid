package com.hatchgrid.thryve.authentication.application.query

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.authentication.application.AuthenticatedUser
import com.hatchgrid.thryve.authentication.domain.UserSession
import com.hatchgrid.thryve.authentication.domain.error.InvalidTokenException
import java.util.*
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder

@Service
class GetUserSessionQueryHandler(
    private val reactiveJwtDecoder: ReactiveJwtDecoder
) : QueryHandler<GetUserSessionQuery, UserSession> {

    override suspend fun handle(query: GetUserSessionQuery): UserSession = try {
        val jwt = reactiveJwtDecoder.decode(query.accessToken)?.awaitSingle()
            ?: throw InvalidTokenException("Invalid access token - decoder returned null")
        val userId = UUID.fromString(jwt.subject)
        val email = jwt.claims["email"] as String
        val realmAccess = jwt.claims["realm_access"] as? Map<String, Any>
        val roles = jwt.getClaimAsStringList("roles") ?: emptyList()
        UserSession(userId, email, roles)
    } catch (e: Exception) {
        throw InvalidTokenException("Invalid access token", e)
    }
}
