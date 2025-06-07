package com.hatchgrid.thryve.newsletter.subscriber.domain

import com.hatchgrid.common.domain.BaseId
import java.util.*

class SubscriptionListId(private val id: UUID) : BaseId<UUID>(id) {
    constructor(id: String) : this(UUID.fromString(id))
}
