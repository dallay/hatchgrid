package com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper

import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.infrastructure.persistence.entity.WorkspaceEntity
import com.hatchgrid.thryve.users.domain.UserId

/**
 * This object provides mapping functions to convert between domain and entity objects.
 */
object WorkspaceMapper {
    /**
     * Converts a [Workspace] domain object to a [WorkspaceEntity].
     *
     * @receiver The [Workspace] domain object to convert.
     * @return The converted [WorkspaceEntity].
     */
    fun Workspace.toEntity(): WorkspaceEntity = WorkspaceEntity(
        id = id.value,
        name = name,
        description = description,
        ownerId = ownerId.value,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )

    /**
     * Converts a [WorkspaceEntity] to a [Workspace] domain object.
     *
     * @receiver The [WorkspaceEntity] to convert.
     * @return The converted [Workspace] domain object.
     */
    fun WorkspaceEntity.toDomain(): Workspace = Workspace(
        id = WorkspaceId(id),
        name = name,
        description = description,
        ownerId = UserId(ownerId),
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
