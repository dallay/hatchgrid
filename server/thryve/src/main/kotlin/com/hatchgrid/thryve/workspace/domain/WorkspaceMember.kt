package com.hatchgrid.thryve.workspace.domain

import com.hatchgrid.common.domain.BaseEntity

data class WorkspaceMember(
    override val id: WorkspaceMemberId,
    val role: WorkspaceRole = WorkspaceRole.EDITOR,
) : BaseEntity<WorkspaceMemberId>()
