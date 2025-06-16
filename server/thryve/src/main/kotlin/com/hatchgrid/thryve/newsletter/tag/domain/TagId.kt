package com.hatchgrid.thryve.newsletter.tag.domain

import com.hatchgrid.common.domain.BaseId
import java.util.*

data class TagId(private val id: UUID) : BaseId<UUID>(id) {
    constructor(id: String) : this(UUID.fromString(id))
}
