package com.hatchgrid.thryve.workspace.application.find.by.member

import com.hatchgrid.thryve.workspace.application.WorkspaceResponses
import com.hatchgrid.common.domain.bus.query.Query

/**
 * This class represents a query to find all workspaces.
 *
 * @property userId The unique identifier of the user.
 */
data class AllWorkspaceByMemberQuery(val userId: String) : Query<WorkspaceResponses>
