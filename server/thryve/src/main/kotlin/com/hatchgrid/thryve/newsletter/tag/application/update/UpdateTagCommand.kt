package com.hatchgrid.thryve.newsletter.tag.application.update

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Command for updating a tag.
 *
 * @property id The unique identifier of the tag.
 * @property name The name of the tag.
 * @property color The color of the tag.
 * @property workspaceId The identifier of the workspace the tag belongs to.
 * @property subscribers The set of emails subscribed to the tag.
 * @created 15/9/24
 */
data class UpdateTagCommand(
    val id: String,
    val name: String?,
    val color: String?,
    val workspaceId: String,
    val subscribers: Set<String>? = emptySet()
) : Command
