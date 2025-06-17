package com.hatchgrid.thryve.newsletter.tag.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

data class SubscriberTaggedEvent(
    val subscriberId: String,
    val tagId: String,
) : BaseDomainEvent()
