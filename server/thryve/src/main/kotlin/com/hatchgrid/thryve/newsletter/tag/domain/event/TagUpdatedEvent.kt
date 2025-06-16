package com.hatchgrid.thryve.newsletter.tag.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

open class TagUpdatedEvent(
    val tagId: String,
    val name: String,
    val color: String,
    val workspaceId: String,
) : BaseDomainEvent()

class TagSubscriberUpdatedEvent(
    val subscribers: Set<String>,
    tagId: String,
    name: String,
    color: String,
    workspaceId: String
) : TagUpdatedEvent(tagId, name, color, workspaceId)

class TagSubscriberDeletedEvent(
    val subscribers: Set<String>,
    tagId: String,
    name: String,
    color: String,
    workspaceId: String
) : TagUpdatedEvent(tagId, name, color, workspaceId)
