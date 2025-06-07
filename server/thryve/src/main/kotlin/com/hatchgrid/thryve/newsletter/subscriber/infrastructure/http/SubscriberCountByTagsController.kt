package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.Paths.SUBSCRIBER
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags.CountByTagsQuery
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags.SubscriberCountByTagsResponse
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class SubscriberCountByTagsController(
    mediator: Mediator
) : ApiController(mediator) {
    @Operation(summary = "Count subscribers by tags")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Success"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("$SUBSCRIBER/count-by-tags")
    @ResponseBody
    suspend fun countByTags(
        @PathVariable workspaceId: String
    ): ResponseEntity<SubscriberCountByTagsResponse> {
        log.debug("Counting subscribers by tags: {}", sanitizeAndJoinPathVariables(workspaceId))
        val response = ask(
            CountByTagsQuery(workspaceId),
        )
        return ResponseEntity.ok(response)
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberCountByTagsController::class.java)
    }
}
