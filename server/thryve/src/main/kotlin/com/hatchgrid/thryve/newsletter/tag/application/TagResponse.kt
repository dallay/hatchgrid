package com.hatchgrid.thryve.newsletter.tag.application

import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import java.io.Serializable

data class TagResponse(
    val id: String,
    val name: String,
    val color: String,
    val workspaceId: String,
    val subscribers: List<String>? = emptyList(),
    val createdAt: String,
    val updatedAt: String?,
) : Serializable {
    companion object {
        private const val serialVersionUID: Long = 1L

        fun from(tag: Tag): TagResponse {
            return TagResponse(
                id = tag.id.value.toString(),
                name = tag.name,
                color = tag.color.value,
                workspaceId = tag.workspaceId.value.toString(),
                subscribers = tag.subscribers?.map { it.value },
                createdAt = tag.createdAt.toString(),
                updatedAt = tag.updatedAt?.toString(),
            )
        }
    }
}
