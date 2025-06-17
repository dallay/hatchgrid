package com.hatchgrid.thryve.newsletter.tag.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

data class TagCreatedEvent(
    val tagId: String,
    val name: String,
    val color: String,
    val workspaceId: String,
) : BaseDomainEvent()
