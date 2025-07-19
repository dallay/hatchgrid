package com.hatchgrid.thryve.authentication.application.query

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.thryve.authentication.domain.UserSession

data class GetUserSessionQuery(val accessToken: String) : Query<UserSession>
