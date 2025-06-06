package com.hatchgrid.thryve.workspace.application.find.by.member

import com.hatchgrid.thryve.workspace.application.WorkspaceResponses
import com.hatchgrid.common.domain.bus.query.Query
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

/**
 * This class represents a query to find all workspaces.
 *
 * @property userId The unique identifier of the user.
 */
data class AllWorkspaceByMemberQuery(
    @field:NotBlank(message = "User ID cannot be blank")
    @field:Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = "User ID must be a valid UUID"
    )
    val userId: String) : Query<WorkspaceResponses>
