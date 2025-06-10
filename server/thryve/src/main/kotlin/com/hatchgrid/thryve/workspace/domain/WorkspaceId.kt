package com.hatchgrid.thryve.workspace.domain

import java.io.Serializable
import java.util.UUID

/**
 * Value object representing a workspace identifier.
 *
 * @property value The UUID value of the workspace identifier.
 */
data class WorkspaceId(val value: UUID) : Serializable {
    constructor(id: String) : this(UUID.fromString(id))

    companion object {
        private const val serialVersionUID: Long = 1L
        fun create() = WorkspaceId(UUID.randomUUID())
    }
}
