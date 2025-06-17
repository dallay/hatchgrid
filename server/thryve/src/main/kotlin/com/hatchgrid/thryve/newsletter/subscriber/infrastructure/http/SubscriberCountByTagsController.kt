package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags.CountByTagsQuery
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags.SubscriberCountByTagsResponse
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
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
    @GetMapping("/workspace/{workspaceId}/newsletter/subscriber/count-by-tags")
    @ResponseBody
    suspend fun countByTags(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        )
        @PathVariable workspaceId: String
    ): ResponseEntity<SubscriberCountByTagsResponse> {
        log.debug("Counting subscribers by tags: {}", sanitizeAndJoinPathVariables(workspaceId))

        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val response = ask(
            CountByTagsQuery(workspaceId, userId),
        )
        return ResponseEntity.ok(response)
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberCountByTagsController::class.java)
    }
}
