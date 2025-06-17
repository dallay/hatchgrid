package com.hatchgrid.thryve.newsletter.tag.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

/**
 * Event class representing the deletion of a tag.
 *
 * @property workspaceId The ID of the workspace to which the tag belongs.
 * @property tagId The ID of the tag that was deleted.
 */
data class DeleteTagEvent(
    val workspaceId: String,
    val tagId: String
) : BaseDomainEvent()
