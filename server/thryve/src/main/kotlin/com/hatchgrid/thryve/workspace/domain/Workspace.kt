package com.hatchgrid.thryve.workspace.domain

import com.hatchgrid.common.domain.AggregateRoot
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceCreatedEvent
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceUpdatedEvent
import java.time.LocalDateTime
import java.util.UUID

/**
 * Workspace domain model. This is the root of the workspace aggregate.
 * It contains all the information about a workspace.
 *
 * @property id The unique identifier of the workspace.
 * @property name The name of the workspace.
 * @property description The description of the workspace.
 * @property ownerId The ID of the user who owns the workspace.
 * @property members The list of user IDs who are members of the workspace.
 * @property createdAt The date and time when the workspace was created.
 * @property updatedAt The date and time when the workspace was last updated.
 */
data class Workspace(
    override val id: WorkspaceId,
    var name: String,
    var description: String? = null,
    val ownerId: UserId,
    val members: MutableSet<UserId> = mutableSetOf(),
    override val createdAt: LocalDateTime = LocalDateTime.now(),
    override val createdBy: String = "system",
    override var updatedAt: LocalDateTime? = createdAt,
    override var updatedBy: String? = null
) : AggregateRoot<WorkspaceId>() {

    init {
        // Owner is always a member
        members.add(ownerId)
    }

    /**
     * Adds a user to the workspace.
     *
     * @param userId The ID of the user to add.
     * @return True if the user was added, false if the user was already a member.
     */
    fun addMember(userId: UUID): Boolean = members.add(UserId(userId))

    /**
     * Removes a user from the workspace.
     *
     * @param userId The ID of the user to remove.
     * @return True if the user was removed, false if the user was not a member or is the owner.
     */
    fun removeMember(userId: UUID): Boolean {
        // Owner cannot be removed
        if (UserId(userId) == ownerId) {
            return false
        }
        return members.remove(UserId(userId))
    }

    /**
     * Checks if a user is a member of the workspace.
     *
     * @param userId The ID of the user to check.
     * @return True if the user is a member, false otherwise.
     */
    fun isMember(userId: UUID): Boolean = members.contains(UserId(userId))

    /**
     * Checks if a user is the owner of the workspace.
     *
     * @param userId The ID of the user to check.
     * @return True if the user is the owner, false otherwise.
     */
    fun isOwner(userId: UUID): Boolean = ownerId == UserId(userId)

    /**
     * Updates the workspace information.
     *
     * @param name The new name of the workspace.
     * @param description The new description of the workspace. If null, the existing description is retained.
     */
    fun update(name: String, description: String? = this.description) {
        this.name = name
        this.description = description
        this.updatedAt = LocalDateTime.now()

        // Record the workspace updated event
        record(
            WorkspaceUpdatedEvent(
                id = this.id.value.toString(),
                workspaceName = this.name,
                ownerId = this.ownerId.value.toString()
            )
        )
    }

    companion object {
        /**
         * Creates a new workspace with the given information.
         *
         * @param id The unique identifier for the workspace.
         * @param name The name of the workspace.
         * @param description The description of the workspace.
         * @param ownerId The ID of the user who owns the workspace.
         * @return The newly created Workspace object.
         */
        fun create(
            id: UUID,
            name: String,
            description: String? = null,
            ownerId: UUID
        ): Workspace {
            val workspaceId = WorkspaceId(id.toString())
            val owner = UserId(ownerId.toString())
            val workspace = Workspace(
                id =  workspaceId,
                name = name,
                description = description,
                ownerId = owner,
                members = mutableSetOf(owner)
            )

            // Record the workspace created event
            workspace.record(
                WorkspaceCreatedEvent(
                    id = workspace.id.value.toString(),
                    name = workspace.name,
                    ownerId = workspace.ownerId.value.toString()
                )
            )

            return workspace
        }
    }
}
