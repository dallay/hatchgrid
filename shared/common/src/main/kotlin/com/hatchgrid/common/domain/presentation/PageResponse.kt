package com.hatchgrid.common.domain.presentation

import com.hatchgrid.common.domain.bus.query.Response

open class PageResponse<T>(
    open val data: Collection<T>
) : Response
