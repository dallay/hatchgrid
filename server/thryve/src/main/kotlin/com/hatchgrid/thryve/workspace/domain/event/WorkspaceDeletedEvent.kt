package com.hatchgrid.thryve.workspace.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

/**
 * Event that represents a workspace being deleted.
 *
 * @property id The id of the workspace that was deleted.
 */
data class WorkspaceDeletedEvent(
    val id: String
) : BaseDomainEvent()
