package com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper

import com.hatchgrid.thryve.workspace.domain.WorkspaceMember
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberId
import com.hatchgrid.thryve.workspace.domain.WorkspaceRole
import com.hatchgrid.thryve.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.UUID

class WorkspaceMemberMapperTest {

    @Test
    fun `should map WorkspaceMemberEntity to WorkspaceMember domain object`() {
        // Given
        val workspaceId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val entity = WorkspaceMemberEntity(
            workspaceId = workspaceId,
            userId = userId,
            role = WorkspaceRole.ADMIN,
            createdAt = LocalDateTime.now()
        )

        val expectedDomainObject = WorkspaceMember(
            id = WorkspaceMemberId(workspaceId, userId),
            role = WorkspaceRole.ADMIN
        )

        // When
        val actualDomainObject = entity.toDomain()

        // Then
        assertEquals(expectedDomainObject.id, actualDomainObject.id)
        assertEquals(expectedDomainObject.role, actualDomainObject.role)
    }
}
