package com.hatchgrid.thryve.newsletter.subscriber.application

import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.common.domain.bus.query.Response

data class SubscribersResponse(val subscribers: List<SubscriberResponse>) : Response

data class SubscriberResponse(
    val id: String,
    val email: String,
    val name: String,
    val status: String,
    val attributes: Attributes? = null,
    val workspaceId: String,
    val createdAt: String? = null,
    val updatedAt: String? = null,
) : Response {
    companion object {
        fun from(subscriber: Subscriber) = SubscriberResponse(
            id = subscriber.id.value.toString(),
            email = subscriber.email.value,
            name = subscriber.name.fullName(),
            status = subscriber.status.name,
            attributes = subscriber.attributes,
            workspaceId = subscriber.workspaceId.value.toString(),
            createdAt = subscriber.createdAt.toString(),
            updatedAt = subscriber.updatedAt?.toString(),
        )
    }
}
