package com.hatchgrid.thryve.authentication.application.query

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.thryve.authentication.domain.AccessToken
import java.util.*

/**
 *
 * @created 31/7/23
 */
data class RefreshTokenQuery(
    val id: UUID = UUID.randomUUID(),
    val refreshToken: String,
) : Query<AccessToken>
