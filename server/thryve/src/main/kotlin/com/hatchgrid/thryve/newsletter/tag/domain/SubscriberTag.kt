package com.hatchgrid.thryve.newsletter.tag.domain

import com.hatchgrid.common.domain.BaseEntity
import com.hatchgrid.thryve.newsletter.tag.domain.event.SubscriberTaggedEvent
import java.time.LocalDateTime

data class SubscriberTag(
    override val id: SubscriberTagId,
    override val createdAt: LocalDateTime = LocalDateTime.now(),
    override val createdBy: String = "system",
    override var updatedAt: LocalDateTime? = createdAt,
    override var updatedBy: String? = null
) : BaseEntity<SubscriberTagId>() {
    companion object {
        fun create(id: SubscriberTagId): SubscriberTag {
            val event = SubscriberTaggedEvent(
                id.value.first.toString(),
                id.value.second.toString(),
            )
            val subscriberTag = SubscriberTag(id)
            subscriberTag.record(event)
            return subscriberTag
        }
    }
}
