package com.hatchgrid.thryve.workspace.domain

import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class WorkspaceTest {

    private lateinit var workspace: Workspace
    private lateinit var workspaceId: UUID
    private lateinit var ownerId: UUID
    private lateinit var memberId: UUID

    @BeforeEach
    fun setUp() {
        workspaceId = UUID.randomUUID()
        ownerId = UUID.randomUUID()
        memberId = UUID.randomUUID()
        workspace =
            Workspace.create(workspaceId, "Test Workspace", "Workspace description", ownerId)
    }

    @Test
    fun `create workspace`() {
        assertNotNull(workspace)
        assertEquals(workspaceId, workspace.id.value)
        assertEquals("Test Workspace", workspace.name)
        assertEquals("Workspace description", workspace.description)
        assertEquals(ownerId, workspace.ownerId.value)
        assertNotNull(workspace.createdAt)
        assertNotNull(workspace.updatedAt)
    }

    @Test
    fun `should include owner as member`() {
        assertTrue(workspace.isMember(ownerId))
    }

    @Test
    fun `should add new member and report success`() {
        val added = workspace.addMember(memberId)
        assertTrue(added)
        assertTrue(workspace.isMember(memberId))
    }

    @Test
    fun `should not add existing member`() {
        workspace.addMember(memberId)
        val addedAgain = workspace.addMember(memberId)
        assertFalse(addedAgain)
    }

    @Test
    fun `should remove non-owner member and report success`() {
        workspace.addMember(memberId)
        val removed = workspace.removeMember(memberId)
        assertTrue(removed)
        assertFalse(workspace.isMember(memberId))
    }

    @Test
    fun `should not remove non-existent member`() {
        val removed = workspace.removeMember(UUID.randomUUID())
        assertFalse(removed)
    }

    @Test
    fun `should not remove owner`() {
        val removedOwner = workspace.removeMember(ownerId)
        assertFalse(removedOwner)
        assertTrue(workspace.isMember(ownerId))
    }

    @Test
    fun `isMember and isOwner predicates`() {
        workspace.addMember(memberId)
        assertTrue(workspace.isMember(memberId))
        assertTrue(workspace.isOwner(ownerId))
        assertFalse(workspace.isOwner(memberId))
    }

    @Test
    fun `update workspace`() {
        workspace.update("New Name")
        assertEquals("New Name", workspace.name)
        assertNotNull(workspace.updatedAt)
    }

    @Test
    fun `update workspace name and description`() {
        workspace.update("New Name", "New Description")
        assertEquals("New Name", workspace.name)
        assertEquals("New Description", workspace.description)
        assertNotNull(workspace.updatedAt)
    }
}
